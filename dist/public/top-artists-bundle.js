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
class SpotifyPlayback {
    constructor() {
        this.isExecutingAction = false;
        this.player = null;
        this.device_id = '';
        this.getStateInterval = null;
        this.selPlaying = {
            element: null,
            track_uri: '',
            trackDataNode: null
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
            this.webPlayerEl.appendWebPlayerHtml(() => this.tryPlayPrev(this.selPlaying.trackDataNode), () => this.tryWebPlayerPause(this.selPlaying.trackDataNode), () => this.tryPlayNext(this.selPlaying.trackDataNode), () => this.onSeekStart(this.player, this.webPlayerEl), (percentage) => this.seekSong(percentage, this.player, this.webPlayerEl), (percentage) => this.onSeeking(percentage, this.webPlayerEl), (percentage, save) => this.setVolume(percentage, this.player, save), parseFloat(loadedVolume));
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
            this.setSelPlayingEl(new track_play_args_1.default(prevTrack, currNode));
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
                    this.setSelPlayingEl(new track_play_args_1.default(prevTrack, currNode.previous));
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
            const nextTrack = currNode.next.data;
            this.setSelPlayingEl(new track_play_args_1.default(nextTrack, currNode.next));
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
        (_a = this.selPlaying.trackDataNode) === null || _a === void 0 ? void 0 : _a.data.onStopped();
        this.selPlaying.element.classList.remove(config_1.config.CSS.CLASSES.selected);
        (_b = this.webPlayerEl.playPause) === null || _b === void 0 ? void 0 : _b.classList.remove(config_1.config.CSS.CLASSES.selected);
        this.selPlaying.element = null;
    }
    selectTrack(eventArg) {
        var _a, _b;
        this.selPlaying.trackDataNode = eventArg.playableNode;
        this.selPlaying.element = eventArg.currPlayable.selEl;
        this.selPlaying.element.classList.add(config_1.config.CSS.CLASSES.selected);
        this.selPlaying.track_uri = eventArg.currPlayable.uri;
        (_a = this.webPlayerEl.playPause) === null || _a === void 0 ? void 0 : _a.classList.add(config_1.config.CSS.CLASSES.selected);
        this.webPlayerEl.setTitle(eventArg.currPlayable.title);
        this.webPlayerEl.setImgSrc(eventArg.currPlayable.imageUrl);
        this.webPlayerEl.setArtists(eventArg.currPlayable.artistsHtml);
        (_b = this.selPlaying.trackDataNode) === null || _b === void 0 ? void 0 : _b.data.onPlaying();
    }
    onTrackFinish() {
        this.completelyDeselectTrack();
        this.webPlayerEl.songProgress.sliderProgress.style.width = '100%';
        clearInterval(this.getStateInterval);
        this.tryPlayNext(this.selPlaying.trackDataNode);
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
    setSelPlayingEl(eventArg) {
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
                (_a = this.selPlaying.trackDataNode) === null || _a === void 0 ? void 0 : _a.data.onStopped();
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
                yield this.startTrack(() => __awaiter(this, void 0, void 0, function* () { return this.resume(); }), eventArg);
                this.isExecutingAction = false;
                return;
            }
            console.log('start track');
            yield this.startTrack(() => __awaiter(this, void 0, void 0, function* () { return this.play(eventArg.currPlayable.uri); }), eventArg);
            this.isExecutingAction = false;
        });
    }
    startTrack(playingAsyncFunc, eventArg) {
        return __awaiter(this, void 0, void 0, function* () {
            this.selectTrack(eventArg);
            yield playingAsyncFunc();
            // set playing state once song starts playing
            this.setGetStateInterval();
        });
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
eventAggregator.subscribe(track_play_args_1.default.name, (eventArg) => spotifyPlayback.setSelPlayingEl(eventArg));
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
                    <div ${config_1.config.CSS.ATTRIBUTES.restrictFlipOnClick}="true" id="${this._uri}" class="${config_1.config.CSS.CLASSES.playBtn} ${(0, playback_sdk_1.isSamePlayingURI)(this.uri) ? config_1.config.CSS.CLASSES.selected : ''}" title="Click to play song"></div>
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
    playPauseClick(trackNode) {
        const track = this;
        // select this track to play or pause by publishing the track play event arg
        eventAggregator.publish(new track_play_args_1.default(track, trackNode));
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
              <button id="${playPauseId}" class="${config_1.config.CSS.CLASSES.playBtn} ${(0, playback_sdk_1.isSamePlayingURI)(this.uri) ? config_1.config.CSS.CLASSES.selected : ''}">
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
        playPauseBtn === null || playPauseBtn === void 0 ? void 0 : playPauseBtn.addEventListener('click', () => this.playPauseClick(trackNode));
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
            <div class="${config_1.config.CSS.CLASSES.rankedTrackInteract} ${(0, playback_sdk_1.isSamePlayingURI)(this.uri) ? config_1.config.CSS.CLASSES.selected : ''}">
              <button id="${this._uri}" class="${config_1.config.CSS.CLASSES.playBtn} ${(0, playback_sdk_1.isSamePlayingURI)(this.uri) ? config_1.config.CSS.CLASSES.selected : ''}">
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
            this.playPauseClick(trackNode);
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
exports.addItemsToPlaylist = exports.throwExpression = exports.getPixelPosInElOnClick = exports.animationControl = exports.removeAllChildNodes = exports.getValidImage = exports.capitalizeFirstLetter = exports.isEllipsisActive = exports.getTextWidth = exports.searchUl = exports.promiseHandler = exports.htmlToEl = exports.millisToMinutesAndSeconds = exports.config = void 0;
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
            username: 'username'
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
        profileUser: '/images/profile-user.png'
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
function getTokens(onNoToken) {
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
        (0, user_data_1.displayUsername)();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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SUFBSSxFQUFFLFVBQVUsQ0FBQyxjQUFjLEVBQUUsb0JBQW9CLENBQUM7UUFDM0UsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQ0g7SUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLGdCQUFnQixDQUFDLEVBQUUsRUFBRTtRQUNqRSxnQkFBZ0IsRUFBRTtJQUNwQixDQUFDLENBQUM7QUFDSixDQUFDLENBQUMsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDNU9KLG1HQUE0QztBQUM1QywrRUFBaUQ7QUFFakQsU0FBc0IsZUFBZTs7UUFDbkMsMkJBQWMsRUFBK0IsZUFBSyxDQUFDLE9BQU8sQ0FBZ0IsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxlQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUNsSSxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGVBQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQztZQUNqRSxJQUFJLFFBQVEsRUFBRTtnQkFDWixRQUFRLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQyxJQUFJO2FBQ2hDO1FBQ0gsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUFBO0FBUEQsMENBT0M7Ozs7Ozs7VUNWRDtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvaW5kZXguanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2FkYXB0ZXJzL3hoci5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvYXhpb3MuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWwuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWxUb2tlbi5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL2lzQ2FuY2VsLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0F4aW9zLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0ludGVyY2VwdG9yTWFuYWdlci5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9idWlsZEZ1bGxQYXRoLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2NyZWF0ZUVycm9yLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2Rpc3BhdGNoUmVxdWVzdC5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9lbmhhbmNlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvbWVyZ2VDb25maWcuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvc2V0dGxlLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3RyYW5zZm9ybURhdGEuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2RlZmF1bHRzLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2JpbmQuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYnVpbGRVUkwuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29tYmluZVVSTHMuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0Fic29sdXRlVVJMLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQXhpb3NFcnJvci5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc1VSTFNhbWVPcmlnaW4uanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZS5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9wYXJzZUhlYWRlcnMuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvc3ByZWFkLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi91dGlscy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9TZWxlY3RhYmxlVGFiRWxzLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL2FsYnVtLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL2FydGlzdC50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9hc3luY1NlbGVjdGlvblZlcmlmLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL2NhcmQudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvZG91Ymx5LWxpbmtlZC1saXN0LnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL3BsYXliYWNrLXNkay50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9wdWJzdWIvYWdncmVnYXRvci50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9wdWJzdWIvZXZlbnQtYXJncy90cmFjay1wbGF5LWFyZ3MudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvcHVic3ViL3N1YnNjcmlwdGlvbi50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9zYXZlLWxvYWQtdGVybS50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9zcG90aWZ5LXBsYXliYWNrLWVsZW1lbnQudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvdHJhY2sudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbmZpZy50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvbWFuYWdlLXRva2Vucy50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvcGFnZXMvdG9wLWFydGlzdHMtcGFnZS90b3AtYXJ0aXN0cy50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvdXNlci1kYXRhLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL2F4aW9zJyk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgc2V0dGxlID0gcmVxdWlyZSgnLi8uLi9jb3JlL3NldHRsZScpO1xudmFyIGNvb2tpZXMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvY29va2llcycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgYnVpbGRGdWxsUGF0aCA9IHJlcXVpcmUoJy4uL2NvcmUvYnVpbGRGdWxsUGF0aCcpO1xudmFyIHBhcnNlSGVhZGVycyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9wYXJzZUhlYWRlcnMnKTtcbnZhciBpc1VSTFNhbWVPcmlnaW4gPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luJyk7XG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuLi9jb3JlL2NyZWF0ZUVycm9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24geGhyQWRhcHRlcihjb25maWcpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIGRpc3BhdGNoWGhyUmVxdWVzdChyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgcmVxdWVzdERhdGEgPSBjb25maWcuZGF0YTtcbiAgICB2YXIgcmVxdWVzdEhlYWRlcnMgPSBjb25maWcuaGVhZGVycztcblxuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKHJlcXVlc3REYXRhKSkge1xuICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzWydDb250ZW50LVR5cGUnXTsgLy8gTGV0IHRoZSBicm93c2VyIHNldCBpdFxuICAgIH1cblxuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAvLyBIVFRQIGJhc2ljIGF1dGhlbnRpY2F0aW9uXG4gICAgaWYgKGNvbmZpZy5hdXRoKSB7XG4gICAgICB2YXIgdXNlcm5hbWUgPSBjb25maWcuYXV0aC51c2VybmFtZSB8fCAnJztcbiAgICAgIHZhciBwYXNzd29yZCA9IGNvbmZpZy5hdXRoLnBhc3N3b3JkID8gdW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KGNvbmZpZy5hdXRoLnBhc3N3b3JkKSkgOiAnJztcbiAgICAgIHJlcXVlc3RIZWFkZXJzLkF1dGhvcml6YXRpb24gPSAnQmFzaWMgJyArIGJ0b2EodXNlcm5hbWUgKyAnOicgKyBwYXNzd29yZCk7XG4gICAgfVxuXG4gICAgdmFyIGZ1bGxQYXRoID0gYnVpbGRGdWxsUGF0aChjb25maWcuYmFzZVVSTCwgY29uZmlnLnVybCk7XG4gICAgcmVxdWVzdC5vcGVuKGNvbmZpZy5tZXRob2QudG9VcHBlckNhc2UoKSwgYnVpbGRVUkwoZnVsbFBhdGgsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKSwgdHJ1ZSk7XG5cbiAgICAvLyBTZXQgdGhlIHJlcXVlc3QgdGltZW91dCBpbiBNU1xuICAgIHJlcXVlc3QudGltZW91dCA9IGNvbmZpZy50aW1lb3V0O1xuXG4gICAgLy8gTGlzdGVuIGZvciByZWFkeSBzdGF0ZVxuICAgIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gaGFuZGxlTG9hZCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCB8fCByZXF1ZXN0LnJlYWR5U3RhdGUgIT09IDQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGUgcmVxdWVzdCBlcnJvcmVkIG91dCBhbmQgd2UgZGlkbid0IGdldCBhIHJlc3BvbnNlLCB0aGlzIHdpbGwgYmVcbiAgICAgIC8vIGhhbmRsZWQgYnkgb25lcnJvciBpbnN0ZWFkXG4gICAgICAvLyBXaXRoIG9uZSBleGNlcHRpb246IHJlcXVlc3QgdGhhdCB1c2luZyBmaWxlOiBwcm90b2NvbCwgbW9zdCBicm93c2Vyc1xuICAgICAgLy8gd2lsbCByZXR1cm4gc3RhdHVzIGFzIDAgZXZlbiB0aG91Z2ggaXQncyBhIHN1Y2Nlc3NmdWwgcmVxdWVzdFxuICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSAwICYmICEocmVxdWVzdC5yZXNwb25zZVVSTCAmJiByZXF1ZXN0LnJlc3BvbnNlVVJMLmluZGV4T2YoJ2ZpbGU6JykgPT09IDApKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gUHJlcGFyZSB0aGUgcmVzcG9uc2VcbiAgICAgIHZhciByZXNwb25zZUhlYWRlcnMgPSAnZ2V0QWxsUmVzcG9uc2VIZWFkZXJzJyBpbiByZXF1ZXN0ID8gcGFyc2VIZWFkZXJzKHJlcXVlc3QuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpIDogbnVsbDtcbiAgICAgIHZhciByZXNwb25zZURhdGEgPSAhY29uZmlnLnJlc3BvbnNlVHlwZSB8fCBjb25maWcucmVzcG9uc2VUeXBlID09PSAndGV4dCcgPyByZXF1ZXN0LnJlc3BvbnNlVGV4dCA6IHJlcXVlc3QucmVzcG9uc2U7XG4gICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YSxcbiAgICAgICAgc3RhdHVzOiByZXF1ZXN0LnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogcmVxdWVzdC5zdGF0dXNUZXh0LFxuICAgICAgICBoZWFkZXJzOiByZXNwb25zZUhlYWRlcnMsXG4gICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICByZXF1ZXN0OiByZXF1ZXN0XG4gICAgICB9O1xuXG4gICAgICBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgYnJvd3NlciByZXF1ZXN0IGNhbmNlbGxhdGlvbiAoYXMgb3Bwb3NlZCB0byBhIG1hbnVhbCBjYW5jZWxsYXRpb24pXG4gICAgcmVxdWVzdC5vbmFib3J0ID0gZnVuY3Rpb24gaGFuZGxlQWJvcnQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ1JlcXVlc3QgYWJvcnRlZCcsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBsb3cgbGV2ZWwgbmV0d29yayBlcnJvcnNcbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiBoYW5kbGVFcnJvcigpIHtcbiAgICAgIC8vIFJlYWwgZXJyb3JzIGFyZSBoaWRkZW4gZnJvbSB1cyBieSB0aGUgYnJvd3NlclxuICAgICAgLy8gb25lcnJvciBzaG91bGQgb25seSBmaXJlIGlmIGl0J3MgYSBuZXR3b3JrIGVycm9yXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ05ldHdvcmsgRXJyb3InLCBjb25maWcsIG51bGwsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSB0aW1lb3V0XG4gICAgcmVxdWVzdC5vbnRpbWVvdXQgPSBmdW5jdGlvbiBoYW5kbGVUaW1lb3V0KCkge1xuICAgICAgdmFyIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSAndGltZW91dCBvZiAnICsgY29uZmlnLnRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnO1xuICAgICAgaWYgKGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlKSB7XG4gICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSBjb25maWcudGltZW91dEVycm9yTWVzc2FnZTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcih0aW1lb3V0RXJyb3JNZXNzYWdlLCBjb25maWcsICdFQ09OTkFCT1JURUQnLFxuICAgICAgICByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAvLyBUaGlzIGlzIG9ubHkgZG9uZSBpZiBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudC5cbiAgICAvLyBTcGVjaWZpY2FsbHkgbm90IGlmIHdlJ3JlIGluIGEgd2ViIHdvcmtlciwgb3IgcmVhY3QtbmF0aXZlLlxuICAgIGlmICh1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpKSB7XG4gICAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAgIHZhciB4c3JmVmFsdWUgPSAoY29uZmlnLndpdGhDcmVkZW50aWFscyB8fCBpc1VSTFNhbWVPcmlnaW4oZnVsbFBhdGgpKSAmJiBjb25maWcueHNyZkNvb2tpZU5hbWUgP1xuICAgICAgICBjb29raWVzLnJlYWQoY29uZmlnLnhzcmZDb29raWVOYW1lKSA6XG4gICAgICAgIHVuZGVmaW5lZDtcblxuICAgICAgaWYgKHhzcmZWYWx1ZSkge1xuICAgICAgICByZXF1ZXN0SGVhZGVyc1tjb25maWcueHNyZkhlYWRlck5hbWVdID0geHNyZlZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBoZWFkZXJzIHRvIHRoZSByZXF1ZXN0XG4gICAgaWYgKCdzZXRSZXF1ZXN0SGVhZGVyJyBpbiByZXF1ZXN0KSB7XG4gICAgICB1dGlscy5mb3JFYWNoKHJlcXVlc3RIZWFkZXJzLCBmdW5jdGlvbiBzZXRSZXF1ZXN0SGVhZGVyKHZhbCwga2V5KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVxdWVzdERhdGEgPT09ICd1bmRlZmluZWQnICYmIGtleS50b0xvd2VyQ2FzZSgpID09PSAnY29udGVudC10eXBlJykge1xuICAgICAgICAgIC8vIFJlbW92ZSBDb250ZW50LVR5cGUgaWYgZGF0YSBpcyB1bmRlZmluZWRcbiAgICAgICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBPdGhlcndpc2UgYWRkIGhlYWRlciB0byB0aGUgcmVxdWVzdFxuICAgICAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihrZXksIHZhbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFkZCB3aXRoQ3JlZGVudGlhbHMgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMpKSB7XG4gICAgICByZXF1ZXN0LndpdGhDcmVkZW50aWFscyA9ICEhY29uZmlnLndpdGhDcmVkZW50aWFscztcbiAgICB9XG5cbiAgICAvLyBBZGQgcmVzcG9uc2VUeXBlIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKGNvbmZpZy5yZXNwb25zZVR5cGUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gRXhwZWN0ZWQgRE9NRXhjZXB0aW9uIHRocm93biBieSBicm93c2VycyBub3QgY29tcGF0aWJsZSBYTUxIdHRwUmVxdWVzdCBMZXZlbCAyLlxuICAgICAgICAvLyBCdXQsIHRoaXMgY2FuIGJlIHN1cHByZXNzZWQgZm9yICdqc29uJyB0eXBlIGFzIGl0IGNhbiBiZSBwYXJzZWQgYnkgZGVmYXVsdCAndHJhbnNmb3JtUmVzcG9uc2UnIGZ1bmN0aW9uLlxuICAgICAgICBpZiAoY29uZmlnLnJlc3BvbnNlVHlwZSAhPT0gJ2pzb24nKSB7XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEhhbmRsZSBwcm9ncmVzcyBpZiBuZWVkZWRcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25Eb3dubG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICAvLyBOb3QgYWxsIGJyb3dzZXJzIHN1cHBvcnQgdXBsb2FkIGV2ZW50c1xuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicgJiYgcmVxdWVzdC51cGxvYWQpIHtcbiAgICAgIHJlcXVlc3QudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICAgIC8vIEhhbmRsZSBjYW5jZWxsYXRpb25cbiAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbi5wcm9taXNlLnRoZW4oZnVuY3Rpb24gb25DYW5jZWxlZChjYW5jZWwpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVxdWVzdC5hYm9ydCgpO1xuICAgICAgICByZWplY3QoY2FuY2VsKTtcbiAgICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghcmVxdWVzdERhdGEpIHtcbiAgICAgIHJlcXVlc3REYXRhID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBTZW5kIHRoZSByZXF1ZXN0XG4gICAgcmVxdWVzdC5zZW5kKHJlcXVlc3REYXRhKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG52YXIgQXhpb3MgPSByZXF1aXJlKCcuL2NvcmUvQXhpb3MnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vY29yZS9tZXJnZUNvbmZpZycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkZWZhdWx0Q29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKiBAcmV0dXJuIHtBeGlvc30gQSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqL1xuZnVuY3Rpb24gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdENvbmZpZykge1xuICB2YXIgY29udGV4dCA9IG5ldyBBeGlvcyhkZWZhdWx0Q29uZmlnKTtcbiAgdmFyIGluc3RhbmNlID0gYmluZChBeGlvcy5wcm90b3R5cGUucmVxdWVzdCwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBheGlvcy5wcm90b3R5cGUgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBBeGlvcy5wcm90b3R5cGUsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgY29udGV4dCB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIGNvbnRleHQpO1xuXG4gIHJldHVybiBpbnN0YW5jZTtcbn1cblxuLy8gQ3JlYXRlIHRoZSBkZWZhdWx0IGluc3RhbmNlIHRvIGJlIGV4cG9ydGVkXG52YXIgYXhpb3MgPSBjcmVhdGVJbnN0YW5jZShkZWZhdWx0cyk7XG5cbi8vIEV4cG9zZSBBeGlvcyBjbGFzcyB0byBhbGxvdyBjbGFzcyBpbmhlcml0YW5jZVxuYXhpb3MuQXhpb3MgPSBBeGlvcztcblxuLy8gRmFjdG9yeSBmb3IgY3JlYXRpbmcgbmV3IGluc3RhbmNlc1xuYXhpb3MuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGluc3RhbmNlQ29uZmlnKSB7XG4gIHJldHVybiBjcmVhdGVJbnN0YW5jZShtZXJnZUNvbmZpZyhheGlvcy5kZWZhdWx0cywgaW5zdGFuY2VDb25maWcpKTtcbn07XG5cbi8vIEV4cG9zZSBDYW5jZWwgJiBDYW5jZWxUb2tlblxuYXhpb3MuQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsJyk7XG5heGlvcy5DYW5jZWxUb2tlbiA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbFRva2VuJyk7XG5heGlvcy5pc0NhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL2lzQ2FuY2VsJyk7XG5cbi8vIEV4cG9zZSBhbGwvc3ByZWFkXG5heGlvcy5hbGwgPSBmdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbn07XG5heGlvcy5zcHJlYWQgPSByZXF1aXJlKCcuL2hlbHBlcnMvc3ByZWFkJyk7XG5cbi8vIEV4cG9zZSBpc0F4aW9zRXJyb3JcbmF4aW9zLmlzQXhpb3NFcnJvciA9IHJlcXVpcmUoJy4vaGVscGVycy9pc0F4aW9zRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBheGlvcztcblxuLy8gQWxsb3cgdXNlIG9mIGRlZmF1bHQgaW1wb3J0IHN5bnRheCBpbiBUeXBlU2NyaXB0XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gYXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQSBgQ2FuY2VsYCBpcyBhbiBvYmplY3QgdGhhdCBpcyB0aHJvd24gd2hlbiBhbiBvcGVyYXRpb24gaXMgY2FuY2VsZWQuXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZz19IG1lc3NhZ2UgVGhlIG1lc3NhZ2UuXG4gKi9cbmZ1bmN0aW9uIENhbmNlbChtZXNzYWdlKSB7XG4gIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG59XG5cbkNhbmNlbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgcmV0dXJuICdDYW5jZWwnICsgKHRoaXMubWVzc2FnZSA/ICc6ICcgKyB0aGlzLm1lc3NhZ2UgOiAnJyk7XG59O1xuXG5DYW5jZWwucHJvdG90eXBlLl9fQ0FOQ0VMX18gPSB0cnVlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4vQ2FuY2VsJyk7XG5cbi8qKlxuICogQSBgQ2FuY2VsVG9rZW5gIGlzIGFuIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIGFuIG9wZXJhdGlvbi5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGV4ZWN1dG9yIFRoZSBleGVjdXRvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsVG9rZW4oZXhlY3V0b3IpIHtcbiAgaWYgKHR5cGVvZiBleGVjdXRvciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4ZWN1dG9yIG11c3QgYmUgYSBmdW5jdGlvbi4nKTtcbiAgfVxuXG4gIHZhciByZXNvbHZlUHJvbWlzZTtcbiAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gcHJvbWlzZUV4ZWN1dG9yKHJlc29sdmUpIHtcbiAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XG4gIH0pO1xuXG4gIHZhciB0b2tlbiA9IHRoaXM7XG4gIGV4ZWN1dG9yKGZ1bmN0aW9uIGNhbmNlbChtZXNzYWdlKSB7XG4gICAgaWYgKHRva2VuLnJlYXNvbikge1xuICAgICAgLy8gQ2FuY2VsbGF0aW9uIGhhcyBhbHJlYWR5IGJlZW4gcmVxdWVzdGVkXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdG9rZW4ucmVhc29uID0gbmV3IENhbmNlbChtZXNzYWdlKTtcbiAgICByZXNvbHZlUHJvbWlzZSh0b2tlbi5yZWFzb24pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUudGhyb3dJZlJlcXVlc3RlZCA9IGZ1bmN0aW9uIHRocm93SWZSZXF1ZXN0ZWQoKSB7XG4gIGlmICh0aGlzLnJlYXNvbikge1xuICAgIHRocm93IHRoaXMucmVhc29uO1xuICB9XG59O1xuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY29udGFpbnMgYSBuZXcgYENhbmNlbFRva2VuYCBhbmQgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCxcbiAqIGNhbmNlbHMgdGhlIGBDYW5jZWxUb2tlbmAuXG4gKi9cbkNhbmNlbFRva2VuLnNvdXJjZSA9IGZ1bmN0aW9uIHNvdXJjZSgpIHtcbiAgdmFyIGNhbmNlbDtcbiAgdmFyIHRva2VuID0gbmV3IENhbmNlbFRva2VuKGZ1bmN0aW9uIGV4ZWN1dG9yKGMpIHtcbiAgICBjYW5jZWwgPSBjO1xuICB9KTtcbiAgcmV0dXJuIHtcbiAgICB0b2tlbjogdG9rZW4sXG4gICAgY2FuY2VsOiBjYW5jZWxcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsVG9rZW47XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNDYW5jZWwodmFsdWUpIHtcbiAgcmV0dXJuICEhKHZhbHVlICYmIHZhbHVlLl9fQ0FOQ0VMX18pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIEludGVyY2VwdG9yTWFuYWdlciA9IHJlcXVpcmUoJy4vSW50ZXJjZXB0b3JNYW5hZ2VyJyk7XG52YXIgZGlzcGF0Y2hSZXF1ZXN0ID0gcmVxdWlyZSgnLi9kaXNwYXRjaFJlcXVlc3QnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vbWVyZ2VDb25maWcnKTtcblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaW5zdGFuY2VDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gQXhpb3MoaW5zdGFuY2VDb25maWcpIHtcbiAgdGhpcy5kZWZhdWx0cyA9IGluc3RhbmNlQ29uZmlnO1xuICB0aGlzLmludGVyY2VwdG9ycyA9IHtcbiAgICByZXF1ZXN0OiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKCksXG4gICAgcmVzcG9uc2U6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKVxuICB9O1xufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyBzcGVjaWZpYyBmb3IgdGhpcyByZXF1ZXN0IChtZXJnZWQgd2l0aCB0aGlzLmRlZmF1bHRzKVxuICovXG5BeGlvcy5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uIHJlcXVlc3QoY29uZmlnKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAvLyBBbGxvdyBmb3IgYXhpb3MoJ2V4YW1wbGUvdXJsJ1ssIGNvbmZpZ10pIGEgbGEgZmV0Y2ggQVBJXG4gIGlmICh0eXBlb2YgY29uZmlnID09PSAnc3RyaW5nJykge1xuICAgIGNvbmZpZyA9IGFyZ3VtZW50c1sxXSB8fCB7fTtcbiAgICBjb25maWcudXJsID0gYXJndW1lbnRzWzBdO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcbiAgfVxuXG4gIGNvbmZpZyA9IG1lcmdlQ29uZmlnKHRoaXMuZGVmYXVsdHMsIGNvbmZpZyk7XG5cbiAgLy8gU2V0IGNvbmZpZy5tZXRob2RcbiAgaWYgKGNvbmZpZy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gY29uZmlnLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2UgaWYgKHRoaXMuZGVmYXVsdHMubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IHRoaXMuZGVmYXVsdHMubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnLm1ldGhvZCA9ICdnZXQnO1xuICB9XG5cbiAgLy8gSG9vayB1cCBpbnRlcmNlcHRvcnMgbWlkZGxld2FyZVxuICB2YXIgY2hhaW4gPSBbZGlzcGF0Y2hSZXF1ZXN0LCB1bmRlZmluZWRdO1xuICB2YXIgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZShjb25maWcpO1xuXG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlcXVlc3QuZm9yRWFjaChmdW5jdGlvbiB1bnNoaWZ0UmVxdWVzdEludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIGNoYWluLnVuc2hpZnQoaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlc3BvbnNlLmZvckVhY2goZnVuY3Rpb24gcHVzaFJlc3BvbnNlSW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgY2hhaW4ucHVzaChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgd2hpbGUgKGNoYWluLmxlbmd0aCkge1xuICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oY2hhaW4uc2hpZnQoKSwgY2hhaW4uc2hpZnQoKSk7XG4gIH1cblxuICByZXR1cm4gcHJvbWlzZTtcbn07XG5cbkF4aW9zLnByb3RvdHlwZS5nZXRVcmkgPSBmdW5jdGlvbiBnZXRVcmkoY29uZmlnKSB7XG4gIGNvbmZpZyA9IG1lcmdlQ29uZmlnKHRoaXMuZGVmYXVsdHMsIGNvbmZpZyk7XG4gIHJldHVybiBidWlsZFVSTChjb25maWcudXJsLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplcikucmVwbGFjZSgvXlxcPy8sICcnKTtcbn07XG5cbi8vIFByb3ZpZGUgYWxpYXNlcyBmb3Igc3VwcG9ydGVkIHJlcXVlc3QgbWV0aG9kc1xudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCcsICdvcHRpb25zJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IChjb25maWcgfHwge30pLmRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGRhdGEsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF4aW9zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIEludGVyY2VwdG9yTWFuYWdlcigpIHtcbiAgdGhpcy5oYW5kbGVycyA9IFtdO1xufVxuXG4vKipcbiAqIEFkZCBhIG5ldyBpbnRlcmNlcHRvciB0byB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdWxmaWxsZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgdGhlbmAgZm9yIGEgYFByb21pc2VgXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3RlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGByZWplY3RgIGZvciBhIGBQcm9taXNlYFxuICpcbiAqIEByZXR1cm4ge051bWJlcn0gQW4gSUQgdXNlZCB0byByZW1vdmUgaW50ZXJjZXB0b3IgbGF0ZXJcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbiB1c2UoZnVsZmlsbGVkLCByZWplY3RlZCkge1xuICB0aGlzLmhhbmRsZXJzLnB1c2goe1xuICAgIGZ1bGZpbGxlZDogZnVsZmlsbGVkLFxuICAgIHJlamVjdGVkOiByZWplY3RlZFxuICB9KTtcbiAgcmV0dXJuIHRoaXMuaGFuZGxlcnMubGVuZ3RoIC0gMTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFuIGludGVyY2VwdG9yIGZyb20gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGlkIFRoZSBJRCB0aGF0IHdhcyByZXR1cm5lZCBieSBgdXNlYFxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmVqZWN0ID0gZnVuY3Rpb24gZWplY3QoaWQpIHtcbiAgaWYgKHRoaXMuaGFuZGxlcnNbaWRdKSB7XG4gICAgdGhpcy5oYW5kbGVyc1tpZF0gPSBudWxsO1xuICB9XG59O1xuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbGwgdGhlIHJlZ2lzdGVyZWQgaW50ZXJjZXB0b3JzXG4gKlxuICogVGhpcyBtZXRob2QgaXMgcGFydGljdWxhcmx5IHVzZWZ1bCBmb3Igc2tpcHBpbmcgb3ZlciBhbnlcbiAqIGludGVyY2VwdG9ycyB0aGF0IG1heSBoYXZlIGJlY29tZSBgbnVsbGAgY2FsbGluZyBgZWplY3RgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIGludGVyY2VwdG9yXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIGZvckVhY2goZm4pIHtcbiAgdXRpbHMuZm9yRWFjaCh0aGlzLmhhbmRsZXJzLCBmdW5jdGlvbiBmb3JFYWNoSGFuZGxlcihoKSB7XG4gICAgaWYgKGggIT09IG51bGwpIHtcbiAgICAgIGZuKGgpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyY2VwdG9yTWFuYWdlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGlzQWJzb2x1dGVVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwnKTtcbnZhciBjb21iaW5lVVJMcyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY29tYmluZVVSTHMnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIGJhc2VVUkwgd2l0aCB0aGUgcmVxdWVzdGVkVVJMLFxuICogb25seSB3aGVuIHRoZSByZXF1ZXN0ZWRVUkwgaXMgbm90IGFscmVhZHkgYW4gYWJzb2x1dGUgVVJMLlxuICogSWYgdGhlIHJlcXVlc3RVUkwgaXMgYWJzb2x1dGUsIHRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgcmVxdWVzdGVkVVJMIHVudG91Y2hlZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXF1ZXN0ZWRVUkwgQWJzb2x1dGUgb3IgcmVsYXRpdmUgVVJMIHRvIGNvbWJpbmVcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBmdWxsIHBhdGhcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZEZ1bGxQYXRoKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCkge1xuICBpZiAoYmFzZVVSTCAmJiAhaXNBYnNvbHV0ZVVSTChyZXF1ZXN0ZWRVUkwpKSB7XG4gICAgcmV0dXJuIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCk7XG4gIH1cbiAgcmV0dXJuIHJlcXVlc3RlZFVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBlbmhhbmNlRXJyb3IgPSByZXF1aXJlKCcuL2VuaGFuY2VFcnJvcicpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgbWVzc2FnZSwgY29uZmlnLCBlcnJvciBjb2RlLCByZXF1ZXN0IGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSBUaGUgZXJyb3IgbWVzc2FnZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgY3JlYXRlZCBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVFcnJvcihtZXNzYWdlLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIHZhciBlcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgcmV0dXJuIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgdHJhbnNmb3JtRGF0YSA9IHJlcXVpcmUoJy4vdHJhbnNmb3JtRGF0YScpO1xudmFyIGlzQ2FuY2VsID0gcmVxdWlyZSgnLi4vY2FuY2VsL2lzQ2FuY2VsJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbmZ1bmN0aW9uIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKSB7XG4gIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICBjb25maWcuY2FuY2VsVG9rZW4udGhyb3dJZlJlcXVlc3RlZCgpO1xuICB9XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgdXNpbmcgdGhlIGNvbmZpZ3VyZWQgYWRhcHRlci5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIFRoZSBjb25maWcgdGhhdCBpcyB0byBiZSB1c2VkIGZvciB0aGUgcmVxdWVzdFxuICogQHJldHVybnMge1Byb21pc2V9IFRoZSBQcm9taXNlIHRvIGJlIGZ1bGZpbGxlZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRpc3BhdGNoUmVxdWVzdChjb25maWcpIHtcbiAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gIC8vIEVuc3VyZSBoZWFkZXJzIGV4aXN0XG4gIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cbiAgLy8gVHJhbnNmb3JtIHJlcXVlc3QgZGF0YVxuICBjb25maWcuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgY29uZmlnLmRhdGEsXG4gICAgY29uZmlnLmhlYWRlcnMsXG4gICAgY29uZmlnLnRyYW5zZm9ybVJlcXVlc3RcbiAgKTtcblxuICAvLyBGbGF0dGVuIGhlYWRlcnNcbiAgY29uZmlnLmhlYWRlcnMgPSB1dGlscy5tZXJnZShcbiAgICBjb25maWcuaGVhZGVycy5jb21tb24gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNbY29uZmlnLm1ldGhvZF0gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNcbiAgKTtcblxuICB1dGlscy5mb3JFYWNoKFxuICAgIFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJywgJ2NvbW1vbiddLFxuICAgIGZ1bmN0aW9uIGNsZWFuSGVhZGVyQ29uZmlnKG1ldGhvZCkge1xuICAgICAgZGVsZXRlIGNvbmZpZy5oZWFkZXJzW21ldGhvZF07XG4gICAgfVxuICApO1xuXG4gIHZhciBhZGFwdGVyID0gY29uZmlnLmFkYXB0ZXIgfHwgZGVmYXVsdHMuYWRhcHRlcjtcblxuICByZXR1cm4gYWRhcHRlcihjb25maWcpLnRoZW4oZnVuY3Rpb24gb25BZGFwdGVyUmVzb2x1dGlvbihyZXNwb25zZSkge1xuICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgcmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgICByZXNwb25zZS5kYXRhLFxuICAgICAgcmVzcG9uc2UuaGVhZGVycyxcbiAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICk7XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH0sIGZ1bmN0aW9uIG9uQWRhcHRlclJlamVjdGlvbihyZWFzb24pIHtcbiAgICBpZiAoIWlzQ2FuY2VsKHJlYXNvbikpIHtcbiAgICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICAgIGlmIChyZWFzb24gJiYgcmVhc29uLnJlc3BvbnNlKSB7XG4gICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuaGVhZGVycyxcbiAgICAgICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVhc29uKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFVwZGF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgY29uZmlnLCBlcnJvciBjb2RlLCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyb3IgVGhlIGVycm9yIHRvIHVwZGF0ZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIGVycm9yLmNvbmZpZyA9IGNvbmZpZztcbiAgaWYgKGNvZGUpIHtcbiAgICBlcnJvci5jb2RlID0gY29kZTtcbiAgfVxuXG4gIGVycm9yLnJlcXVlc3QgPSByZXF1ZXN0O1xuICBlcnJvci5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICBlcnJvci5pc0F4aW9zRXJyb3IgPSB0cnVlO1xuXG4gIGVycm9yLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gU3RhbmRhcmRcbiAgICAgIG1lc3NhZ2U6IHRoaXMubWVzc2FnZSxcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgIC8vIE1pY3Jvc29mdFxuICAgICAgZGVzY3JpcHRpb246IHRoaXMuZGVzY3JpcHRpb24sXG4gICAgICBudW1iZXI6IHRoaXMubnVtYmVyLFxuICAgICAgLy8gTW96aWxsYVxuICAgICAgZmlsZU5hbWU6IHRoaXMuZmlsZU5hbWUsXG4gICAgICBsaW5lTnVtYmVyOiB0aGlzLmxpbmVOdW1iZXIsXG4gICAgICBjb2x1bW5OdW1iZXI6IHRoaXMuY29sdW1uTnVtYmVyLFxuICAgICAgc3RhY2s6IHRoaXMuc3RhY2ssXG4gICAgICAvLyBBeGlvc1xuICAgICAgY29uZmlnOiB0aGlzLmNvbmZpZyxcbiAgICAgIGNvZGU6IHRoaXMuY29kZVxuICAgIH07XG4gIH07XG4gIHJldHVybiBlcnJvcjtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbi8qKlxuICogQ29uZmlnLXNwZWNpZmljIG1lcmdlLWZ1bmN0aW9uIHdoaWNoIGNyZWF0ZXMgYSBuZXcgY29uZmlnLW9iamVjdFxuICogYnkgbWVyZ2luZyB0d28gY29uZmlndXJhdGlvbiBvYmplY3RzIHRvZ2V0aGVyLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcxXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMlxuICogQHJldHVybnMge09iamVjdH0gTmV3IG9iamVjdCByZXN1bHRpbmcgZnJvbSBtZXJnaW5nIGNvbmZpZzIgdG8gY29uZmlnMVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1lcmdlQ29uZmlnKGNvbmZpZzEsIGNvbmZpZzIpIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gIGNvbmZpZzIgPSBjb25maWcyIHx8IHt9O1xuICB2YXIgY29uZmlnID0ge307XG5cbiAgdmFyIHZhbHVlRnJvbUNvbmZpZzJLZXlzID0gWyd1cmwnLCAnbWV0aG9kJywgJ2RhdGEnXTtcbiAgdmFyIG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzID0gWydoZWFkZXJzJywgJ2F1dGgnLCAncHJveHknLCAncGFyYW1zJ107XG4gIHZhciBkZWZhdWx0VG9Db25maWcyS2V5cyA9IFtcbiAgICAnYmFzZVVSTCcsICd0cmFuc2Zvcm1SZXF1ZXN0JywgJ3RyYW5zZm9ybVJlc3BvbnNlJywgJ3BhcmFtc1NlcmlhbGl6ZXInLFxuICAgICd0aW1lb3V0JywgJ3RpbWVvdXRNZXNzYWdlJywgJ3dpdGhDcmVkZW50aWFscycsICdhZGFwdGVyJywgJ3Jlc3BvbnNlVHlwZScsICd4c3JmQ29va2llTmFtZScsXG4gICAgJ3hzcmZIZWFkZXJOYW1lJywgJ29uVXBsb2FkUHJvZ3Jlc3MnLCAnb25Eb3dubG9hZFByb2dyZXNzJywgJ2RlY29tcHJlc3MnLFxuICAgICdtYXhDb250ZW50TGVuZ3RoJywgJ21heEJvZHlMZW5ndGgnLCAnbWF4UmVkaXJlY3RzJywgJ3RyYW5zcG9ydCcsICdodHRwQWdlbnQnLFxuICAgICdodHRwc0FnZW50JywgJ2NhbmNlbFRva2VuJywgJ3NvY2tldFBhdGgnLCAncmVzcG9uc2VFbmNvZGluZydcbiAgXTtcbiAgdmFyIGRpcmVjdE1lcmdlS2V5cyA9IFsndmFsaWRhdGVTdGF0dXMnXTtcblxuICBmdW5jdGlvbiBnZXRNZXJnZWRWYWx1ZSh0YXJnZXQsIHNvdXJjZSkge1xuICAgIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHRhcmdldCkgJiYgdXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2UodGFyZ2V0LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2Uoe30sIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc0FycmF5KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiBzb3VyY2Uuc2xpY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHNvdXJjZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1lcmdlRGVlcFByb3BlcnRpZXMocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIHV0aWxzLmZvckVhY2godmFsdWVGcm9tQ29uZmlnMktleXMsIGZ1bmN0aW9uIHZhbHVlRnJvbUNvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB1dGlscy5mb3JFYWNoKG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzLCBtZXJnZURlZXBQcm9wZXJ0aWVzKTtcblxuICB1dGlscy5mb3JFYWNoKGRlZmF1bHRUb0NvbmZpZzJLZXlzLCBmdW5jdGlvbiBkZWZhdWx0VG9Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChkaXJlY3RNZXJnZUtleXMsIGZ1bmN0aW9uIG1lcmdlKHByb3ApIHtcbiAgICBpZiAocHJvcCBpbiBjb25maWcyKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKHByb3AgaW4gY29uZmlnMSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBheGlvc0tleXMgPSB2YWx1ZUZyb21Db25maWcyS2V5c1xuICAgIC5jb25jYXQobWVyZ2VEZWVwUHJvcGVydGllc0tleXMpXG4gICAgLmNvbmNhdChkZWZhdWx0VG9Db25maWcyS2V5cylcbiAgICAuY29uY2F0KGRpcmVjdE1lcmdlS2V5cyk7XG5cbiAgdmFyIG90aGVyS2V5cyA9IE9iamVjdFxuICAgIC5rZXlzKGNvbmZpZzEpXG4gICAgLmNvbmNhdChPYmplY3Qua2V5cyhjb25maWcyKSlcbiAgICAuZmlsdGVyKGZ1bmN0aW9uIGZpbHRlckF4aW9zS2V5cyhrZXkpIHtcbiAgICAgIHJldHVybiBheGlvc0tleXMuaW5kZXhPZihrZXkpID09PSAtMTtcbiAgICB9KTtcblxuICB1dGlscy5mb3JFYWNoKG90aGVyS2V5cywgbWVyZ2VEZWVwUHJvcGVydGllcyk7XG5cbiAgcmV0dXJuIGNvbmZpZztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4vY3JlYXRlRXJyb3InKTtcblxuLyoqXG4gKiBSZXNvbHZlIG9yIHJlamVjdCBhIFByb21pc2UgYmFzZWQgb24gcmVzcG9uc2Ugc3RhdHVzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlc29sdmUgQSBmdW5jdGlvbiB0aGF0IHJlc29sdmVzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0IEEgZnVuY3Rpb24gdGhhdCByZWplY3RzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIFRoZSByZXNwb25zZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSkge1xuICB2YXIgdmFsaWRhdGVTdGF0dXMgPSByZXNwb25zZS5jb25maWcudmFsaWRhdGVTdGF0dXM7XG4gIGlmICghcmVzcG9uc2Uuc3RhdHVzIHx8ICF2YWxpZGF0ZVN0YXR1cyB8fCB2YWxpZGF0ZVN0YXR1cyhyZXNwb25zZS5zdGF0dXMpKSB7XG4gICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gIH0gZWxzZSB7XG4gICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgJ1JlcXVlc3QgZmFpbGVkIHdpdGggc3RhdHVzIGNvZGUgJyArIHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgIHJlc3BvbnNlLmNvbmZpZyxcbiAgICAgIG51bGwsXG4gICAgICByZXNwb25zZS5yZXF1ZXN0LFxuICAgICAgcmVzcG9uc2VcbiAgICApKTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vKipcbiAqIFRyYW5zZm9ybSB0aGUgZGF0YSBmb3IgYSByZXF1ZXN0IG9yIGEgcmVzcG9uc2VcbiAqXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IGRhdGEgVGhlIGRhdGEgdG8gYmUgdHJhbnNmb3JtZWRcbiAqIEBwYXJhbSB7QXJyYXl9IGhlYWRlcnMgVGhlIGhlYWRlcnMgZm9yIHRoZSByZXF1ZXN0IG9yIHJlc3BvbnNlXG4gKiBAcGFyYW0ge0FycmF5fEZ1bmN0aW9ufSBmbnMgQSBzaW5nbGUgZnVuY3Rpb24gb3IgQXJyYXkgb2YgZnVuY3Rpb25zXG4gKiBAcmV0dXJucyB7Kn0gVGhlIHJlc3VsdGluZyB0cmFuc2Zvcm1lZCBkYXRhXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdHJhbnNmb3JtRGF0YShkYXRhLCBoZWFkZXJzLCBmbnMpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIHV0aWxzLmZvckVhY2goZm5zLCBmdW5jdGlvbiB0cmFuc2Zvcm0oZm4pIHtcbiAgICBkYXRhID0gZm4oZGF0YSwgaGVhZGVycyk7XG4gIH0pO1xuXG4gIHJldHVybiBkYXRhO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIG5vcm1hbGl6ZUhlYWRlck5hbWUgPSByZXF1aXJlKCcuL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZScpO1xuXG52YXIgREVGQVVMVF9DT05URU5UX1RZUEUgPSB7XG4gICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuZnVuY3Rpb24gc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsIHZhbHVlKSB7XG4gIGlmICghdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVycykgJiYgdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVyc1snQ29udGVudC1UeXBlJ10pKSB7XG4gICAgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSB2YWx1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXREZWZhdWx0QWRhcHRlcigpIHtcbiAgdmFyIGFkYXB0ZXI7XG4gIGlmICh0eXBlb2YgWE1MSHR0cFJlcXVlc3QgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gRm9yIGJyb3dzZXJzIHVzZSBYSFIgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL3hocicpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJykge1xuICAgIC8vIEZvciBub2RlIHVzZSBIVFRQIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy9odHRwJyk7XG4gIH1cbiAgcmV0dXJuIGFkYXB0ZXI7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcbiAgYWRhcHRlcjogZ2V0RGVmYXVsdEFkYXB0ZXIoKSxcblxuICB0cmFuc2Zvcm1SZXF1ZXN0OiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVxdWVzdChkYXRhLCBoZWFkZXJzKSB7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQWNjZXB0Jyk7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQ29udGVudC1UeXBlJyk7XG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQXJyYXlCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQnVmZmVyKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc1N0cmVhbShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNGaWxlKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0Jsb2IoZGF0YSlcbiAgICApIHtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNBcnJheUJ1ZmZlclZpZXcoZGF0YSkpIHtcbiAgICAgIHJldHVybiBkYXRhLmJ1ZmZlcjtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKGRhdGEpKSB7XG4gICAgICBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICByZXR1cm4gZGF0YS50b1N0cmluZygpO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNPYmplY3QoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XSxcblxuICB0cmFuc2Zvcm1SZXNwb25zZTogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlc3BvbnNlKGRhdGEpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBkYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHsgLyogSWdub3JlICovIH1cbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIC8qKlxuICAgKiBBIHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzIHRvIGFib3J0IGEgcmVxdWVzdC4gSWYgc2V0IHRvIDAgKGRlZmF1bHQpIGFcbiAgICogdGltZW91dCBpcyBub3QgY3JlYXRlZC5cbiAgICovXG4gIHRpbWVvdXQ6IDAsXG5cbiAgeHNyZkNvb2tpZU5hbWU6ICdYU1JGLVRPS0VOJyxcbiAgeHNyZkhlYWRlck5hbWU6ICdYLVhTUkYtVE9LRU4nLFxuXG4gIG1heENvbnRlbnRMZW5ndGg6IC0xLFxuICBtYXhCb2R5TGVuZ3RoOiAtMSxcblxuICB2YWxpZGF0ZVN0YXR1czogZnVuY3Rpb24gdmFsaWRhdGVTdGF0dXMoc3RhdHVzKSB7XG4gICAgcmV0dXJuIHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwO1xuICB9XG59O1xuXG5kZWZhdWx0cy5oZWFkZXJzID0ge1xuICBjb21tb246IHtcbiAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24sIHRleHQvcGxhaW4sICovKidcbiAgfVxufTtcblxudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB7fTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB1dGlscy5tZXJnZShERUZBVUxUX0NPTlRFTlRfVFlQRSk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0cztcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKCkge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsKSB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsKS5cbiAgICByZXBsYWNlKC8lM0EvZ2ksICc6JykuXG4gICAgcmVwbGFjZSgvJTI0L2csICckJykuXG4gICAgcmVwbGFjZSgvJTJDL2dpLCAnLCcpLlxuICAgIHJlcGxhY2UoLyUyMC9nLCAnKycpLlxuICAgIHJlcGxhY2UoLyU1Qi9naSwgJ1snKS5cbiAgICByZXBsYWNlKC8lNUQvZ2ksICddJyk7XG59XG5cbi8qKlxuICogQnVpbGQgYSBVUkwgYnkgYXBwZW5kaW5nIHBhcmFtcyB0byB0aGUgZW5kXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgYmFzZSBvZiB0aGUgdXJsIChlLmcuLCBodHRwOi8vd3d3Lmdvb2dsZS5jb20pXG4gKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gVGhlIHBhcmFtcyB0byBiZSBhcHBlbmRlZFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGZvcm1hdHRlZCB1cmxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZFVSTCh1cmwsIHBhcmFtcywgcGFyYW1zU2VyaWFsaXplcikge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgaWYgKCFwYXJhbXMpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgdmFyIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIGlmIChwYXJhbXNTZXJpYWxpemVyKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtc1NlcmlhbGl6ZXIocGFyYW1zKTtcbiAgfSBlbHNlIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhwYXJhbXMpKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtcy50b1N0cmluZygpO1xuICB9IGVsc2Uge1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuXG4gICAgdXRpbHMuZm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWwsIGtleSkge1xuICAgICAgaWYgKHZhbCA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh1dGlscy5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAga2V5ID0ga2V5ICsgJ1tdJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IFt2YWxdO1xuICAgICAgfVxuXG4gICAgICB1dGlscy5mb3JFYWNoKHZhbCwgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KSB7XG4gICAgICAgIGlmICh1dGlscy5pc0RhdGUodikpIHtcbiAgICAgICAgICB2ID0gdi50b0lTT1N0cmluZygpO1xuICAgICAgICB9IGVsc2UgaWYgKHV0aWxzLmlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgdiA9IEpTT04uc3RyaW5naWZ5KHYpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUodikpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFydHMuam9pbignJicpO1xuICB9XG5cbiAgaWYgKHNlcmlhbGl6ZWRQYXJhbXMpIHtcbiAgICB2YXIgaGFzaG1hcmtJbmRleCA9IHVybC5pbmRleE9mKCcjJyk7XG4gICAgaWYgKGhhc2htYXJrSW5kZXggIT09IC0xKSB7XG4gICAgICB1cmwgPSB1cmwuc2xpY2UoMCwgaGFzaG1hcmtJbmRleCk7XG4gICAgfVxuXG4gICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBzZXJpYWxpemVkUGFyYW1zO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBzcGVjaWZpZWQgVVJMc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVVJMIFRoZSByZWxhdGl2ZSBVUkxcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBVUkxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZWxhdGl2ZVVSTCkge1xuICByZXR1cm4gcmVsYXRpdmVVUkxcbiAgICA/IGJhc2VVUkwucmVwbGFjZSgvXFwvKyQvLCAnJykgKyAnLycgKyByZWxhdGl2ZVVSTC5yZXBsYWNlKC9eXFwvKy8sICcnKVxuICAgIDogYmFzZVVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBzdXBwb3J0IGRvY3VtZW50LmNvb2tpZVxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUobmFtZSwgdmFsdWUsIGV4cGlyZXMsIHBhdGgsIGRvbWFpbiwgc2VjdXJlKSB7XG4gICAgICAgICAgdmFyIGNvb2tpZSA9IFtdO1xuICAgICAgICAgIGNvb2tpZS5wdXNoKG5hbWUgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpKTtcblxuICAgICAgICAgIGlmICh1dGlscy5pc051bWJlcihleHBpcmVzKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2V4cGlyZXM9JyArIG5ldyBEYXRlKGV4cGlyZXMpLnRvR01UU3RyaW5nKCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhwYXRoKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3BhdGg9JyArIHBhdGgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhkb21haW4pKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZG9tYWluPScgKyBkb21haW4pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzZWN1cmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdzZWN1cmUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWUuam9pbignOyAnKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKG5hbWUpIHtcbiAgICAgICAgICB2YXIgbWF0Y2ggPSBkb2N1bWVudC5jb29raWUubWF0Y2gobmV3IFJlZ0V4cCgnKF58O1xcXFxzKikoJyArIG5hbWUgKyAnKT0oW147XSopJykpO1xuICAgICAgICAgIHJldHVybiAobWF0Y2ggPyBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hbM10pIDogbnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUobmFtZSkge1xuICAgICAgICAgIHRoaXMud3JpdGUobmFtZSwgJycsIERhdGUubm93KCkgLSA4NjQwMDAwMCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52ICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUoKSB7fSxcbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZCgpIHsgcmV0dXJuIG51bGw7IH0sXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBVUkwgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQWJzb2x1dGVVUkwodXJsKSB7XG4gIC8vIEEgVVJMIGlzIGNvbnNpZGVyZWQgYWJzb2x1dGUgaWYgaXQgYmVnaW5zIHdpdGggXCI8c2NoZW1lPjovL1wiIG9yIFwiLy9cIiAocHJvdG9jb2wtcmVsYXRpdmUgVVJMKS5cbiAgLy8gUkZDIDM5ODYgZGVmaW5lcyBzY2hlbWUgbmFtZSBhcyBhIHNlcXVlbmNlIG9mIGNoYXJhY3RlcnMgYmVnaW5uaW5nIHdpdGggYSBsZXR0ZXIgYW5kIGZvbGxvd2VkXG4gIC8vIGJ5IGFueSBjb21iaW5hdGlvbiBvZiBsZXR0ZXJzLCBkaWdpdHMsIHBsdXMsIHBlcmlvZCwgb3IgaHlwaGVuLlxuICByZXR1cm4gL14oW2Etel1bYS16XFxkXFwrXFwtXFwuXSo6KT9cXC9cXC8vaS50ZXN0KHVybCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgcGF5bG9hZCBpcyBhbiBlcnJvciB0aHJvd24gYnkgQXhpb3NcbiAqXG4gKiBAcGFyYW0geyp9IHBheWxvYWQgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvcywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBeGlvc0Vycm9yKHBheWxvYWQpIHtcbiAgcmV0dXJuICh0eXBlb2YgcGF5bG9hZCA9PT0gJ29iamVjdCcpICYmIChwYXlsb2FkLmlzQXhpb3NFcnJvciA9PT0gdHJ1ZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgaGF2ZSBmdWxsIHN1cHBvcnQgb2YgdGhlIEFQSXMgbmVlZGVkIHRvIHRlc3RcbiAgLy8gd2hldGhlciB0aGUgcmVxdWVzdCBVUkwgaXMgb2YgdGhlIHNhbWUgb3JpZ2luIGFzIGN1cnJlbnQgbG9jYXRpb24uXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHZhciBtc2llID0gLyhtc2llfHRyaWRlbnQpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICAgIHZhciB1cmxQYXJzaW5nTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIHZhciBvcmlnaW5VUkw7XG5cbiAgICAgIC8qKlxuICAgICogUGFyc2UgYSBVUkwgdG8gZGlzY292ZXIgaXQncyBjb21wb25lbnRzXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBUaGUgVVJMIHRvIGJlIHBhcnNlZFxuICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAqL1xuICAgICAgZnVuY3Rpb24gcmVzb2x2ZVVSTCh1cmwpIHtcbiAgICAgICAgdmFyIGhyZWYgPSB1cmw7XG5cbiAgICAgICAgaWYgKG1zaWUpIHtcbiAgICAgICAgLy8gSUUgbmVlZHMgYXR0cmlidXRlIHNldCB0d2ljZSB0byBub3JtYWxpemUgcHJvcGVydGllc1xuICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuICAgICAgICAgIGhyZWYgPSB1cmxQYXJzaW5nTm9kZS5ocmVmO1xuICAgICAgICB9XG5cbiAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG5cbiAgICAgICAgLy8gdXJsUGFyc2luZ05vZGUgcHJvdmlkZXMgdGhlIFVybFV0aWxzIGludGVyZmFjZSAtIGh0dHA6Ly91cmwuc3BlYy53aGF0d2cub3JnLyN1cmx1dGlsc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGhyZWY6IHVybFBhcnNpbmdOb2RlLmhyZWYsXG4gICAgICAgICAgcHJvdG9jb2w6IHVybFBhcnNpbmdOb2RlLnByb3RvY29sID8gdXJsUGFyc2luZ05vZGUucHJvdG9jb2wucmVwbGFjZSgvOiQvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0OiB1cmxQYXJzaW5nTm9kZS5ob3N0LFxuICAgICAgICAgIHNlYXJjaDogdXJsUGFyc2luZ05vZGUuc2VhcmNoID8gdXJsUGFyc2luZ05vZGUuc2VhcmNoLnJlcGxhY2UoL15cXD8vLCAnJykgOiAnJyxcbiAgICAgICAgICBoYXNoOiB1cmxQYXJzaW5nTm9kZS5oYXNoID8gdXJsUGFyc2luZ05vZGUuaGFzaC5yZXBsYWNlKC9eIy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3RuYW1lOiB1cmxQYXJzaW5nTm9kZS5ob3N0bmFtZSxcbiAgICAgICAgICBwb3J0OiB1cmxQYXJzaW5nTm9kZS5wb3J0LFxuICAgICAgICAgIHBhdGhuYW1lOiAodXJsUGFyc2luZ05vZGUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpID9cbiAgICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lIDpcbiAgICAgICAgICAgICcvJyArIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIG9yaWdpblVSTCA9IHJlc29sdmVVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgICAvKipcbiAgICAqIERldGVybWluZSBpZiBhIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjdXJyZW50IGxvY2F0aW9uXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHJlcXVlc3RVUkwgVGhlIFVSTCB0byB0ZXN0XG4gICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgKi9cbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4ocmVxdWVzdFVSTCkge1xuICAgICAgICB2YXIgcGFyc2VkID0gKHV0aWxzLmlzU3RyaW5nKHJlcXVlc3RVUkwpKSA/IHJlc29sdmVVUkwocmVxdWVzdFVSTCkgOiByZXF1ZXN0VVJMO1xuICAgICAgICByZXR1cm4gKHBhcnNlZC5wcm90b2NvbCA9PT0gb3JpZ2luVVJMLnByb3RvY29sICYmXG4gICAgICAgICAgICBwYXJzZWQuaG9zdCA9PT0gb3JpZ2luVVJMLmhvc3QpO1xuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnZzICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsIG5vcm1hbGl6ZWROYW1lKSB7XG4gIHV0aWxzLmZvckVhY2goaGVhZGVycywgZnVuY3Rpb24gcHJvY2Vzc0hlYWRlcih2YWx1ZSwgbmFtZSkge1xuICAgIGlmIChuYW1lICE9PSBub3JtYWxpemVkTmFtZSAmJiBuYW1lLnRvVXBwZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWROYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgIGhlYWRlcnNbbm9ybWFsaXplZE5hbWVdID0gdmFsdWU7XG4gICAgICBkZWxldGUgaGVhZGVyc1tuYW1lXTtcbiAgICB9XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vLyBIZWFkZXJzIHdob3NlIGR1cGxpY2F0ZXMgYXJlIGlnbm9yZWQgYnkgbm9kZVxuLy8gYy5mLiBodHRwczovL25vZGVqcy5vcmcvYXBpL2h0dHAuaHRtbCNodHRwX21lc3NhZ2VfaGVhZGVyc1xudmFyIGlnbm9yZUR1cGxpY2F0ZU9mID0gW1xuICAnYWdlJywgJ2F1dGhvcml6YXRpb24nLCAnY29udGVudC1sZW5ndGgnLCAnY29udGVudC10eXBlJywgJ2V0YWcnLFxuICAnZXhwaXJlcycsICdmcm9tJywgJ2hvc3QnLCAnaWYtbW9kaWZpZWQtc2luY2UnLCAnaWYtdW5tb2RpZmllZC1zaW5jZScsXG4gICdsYXN0LW1vZGlmaWVkJywgJ2xvY2F0aW9uJywgJ21heC1mb3J3YXJkcycsICdwcm94eS1hdXRob3JpemF0aW9uJyxcbiAgJ3JlZmVyZXInLCAncmV0cnktYWZ0ZXInLCAndXNlci1hZ2VudCdcbl07XG5cbi8qKlxuICogUGFyc2UgaGVhZGVycyBpbnRvIGFuIG9iamVjdFxuICpcbiAqIGBgYFxuICogRGF0ZTogV2VkLCAyNyBBdWcgMjAxNCAwODo1ODo0OSBHTVRcbiAqIENvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblxuICogQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVxuICogVHJhbnNmZXItRW5jb2Rpbmc6IGNodW5rZWRcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBoZWFkZXJzIEhlYWRlcnMgbmVlZGluZyB0byBiZSBwYXJzZWRcbiAqIEByZXR1cm5zIHtPYmplY3R9IEhlYWRlcnMgcGFyc2VkIGludG8gYW4gb2JqZWN0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VIZWFkZXJzKGhlYWRlcnMpIHtcbiAgdmFyIHBhcnNlZCA9IHt9O1xuICB2YXIga2V5O1xuICB2YXIgdmFsO1xuICB2YXIgaTtcblxuICBpZiAoIWhlYWRlcnMpIHsgcmV0dXJuIHBhcnNlZDsgfVxuXG4gIHV0aWxzLmZvckVhY2goaGVhZGVycy5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uIHBhcnNlcihsaW5lKSB7XG4gICAgaSA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGtleSA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoMCwgaSkpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cihpICsgMSkpO1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgaWYgKHBhcnNlZFtrZXldICYmIGlnbm9yZUR1cGxpY2F0ZU9mLmluZGV4T2Yoa2V5KSA+PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChrZXkgPT09ICdzZXQtY29va2llJykge1xuICAgICAgICBwYXJzZWRba2V5XSA9IChwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldIDogW10pLmNvbmNhdChbdmFsXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJzZWRba2V5XSA9IHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gKyAnLCAnICsgdmFsIDogdmFsO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHBhcnNlZDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU3ludGFjdGljIHN1Z2FyIGZvciBpbnZva2luZyBhIGZ1bmN0aW9uIGFuZCBleHBhbmRpbmcgYW4gYXJyYXkgZm9yIGFyZ3VtZW50cy5cbiAqXG4gKiBDb21tb24gdXNlIGNhc2Ugd291bGQgYmUgdG8gdXNlIGBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHlgLlxuICpcbiAqICBgYGBqc1xuICogIGZ1bmN0aW9uIGYoeCwgeSwgeikge31cbiAqICB2YXIgYXJncyA9IFsxLCAyLCAzXTtcbiAqICBmLmFwcGx5KG51bGwsIGFyZ3MpO1xuICogIGBgYFxuICpcbiAqIFdpdGggYHNwcmVhZGAgdGhpcyBleGFtcGxlIGNhbiBiZSByZS13cml0dGVuLlxuICpcbiAqICBgYGBqc1xuICogIHNwcmVhZChmdW5jdGlvbih4LCB5LCB6KSB7fSkoWzEsIDIsIDNdKTtcbiAqICBgYGBcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNwcmVhZChjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcChhcnIpIHtcbiAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkobnVsbCwgYXJyKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcblxuLypnbG9iYWwgdG9TdHJpbmc6dHJ1ZSovXG5cbi8vIHV0aWxzIGlzIGEgbGlicmFyeSBvZiBnZW5lcmljIGhlbHBlciBmdW5jdGlvbnMgbm9uLXNwZWNpZmljIHRvIGF4aW9zXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXkodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgdW5kZWZpbmVkXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHZhbHVlIGlzIHVuZGVmaW5lZCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQnVmZmVyKHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwpICYmIHZhbC5jb25zdHJ1Y3RvciAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsLmNvbnN0cnVjdG9yKVxuICAgICYmIHR5cGVvZiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyKHZhbCk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXIodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGb3JtRGF0YVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEZvcm1EYXRhLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGb3JtRGF0YSh2YWwpIHtcbiAgcmV0dXJuICh0eXBlb2YgRm9ybURhdGEgIT09ICd1bmRlZmluZWQnKSAmJiAodmFsIGluc3RhbmNlb2YgRm9ybURhdGEpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXJWaWV3KHZhbCkge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpICYmIChBcnJheUJ1ZmZlci5pc1ZpZXcpKSB7XG4gICAgcmVzdWx0ID0gQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gKHZhbCkgJiYgKHZhbC5idWZmZXIpICYmICh2YWwuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJpbmdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmluZywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZyc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBOdW1iZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIE51bWJlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTnVtYmVyKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ251bWJlcic7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWwpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwodmFsKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbCk7XG4gIHJldHVybiBwcm90b3R5cGUgPT09IG51bGwgfHwgcHJvdG90eXBlID09PSBPYmplY3QucHJvdG90eXBlO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRGF0ZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRGF0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRGF0ZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRmlsZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRmlsZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRmlsZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRmlsZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQmxvYlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQmxvYiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQmxvYih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQmxvYl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZ1bmN0aW9uLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmVhbVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyZWFtLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJlYW0odmFsKSB7XG4gIHJldHVybiBpc09iamVjdCh2YWwpICYmIGlzRnVuY3Rpb24odmFsLnBpcGUpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVVJMU2VhcmNoUGFyYW1zKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIFVSTFNlYXJjaFBhcmFtcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsIGluc3RhbmNlb2YgVVJMU2VhcmNoUGFyYW1zO1xufVxuXG4vKipcbiAqIFRyaW0gZXhjZXNzIHdoaXRlc3BhY2Ugb2ZmIHRoZSBiZWdpbm5pbmcgYW5kIGVuZCBvZiBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIFN0cmluZyB0byB0cmltXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgU3RyaW5nIGZyZWVkIG9mIGV4Y2VzcyB3aGl0ZXNwYWNlXG4gKi9cbmZ1bmN0aW9uIHRyaW0oc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyovLCAnJykucmVwbGFjZSgvXFxzKiQvLCAnJyk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIHdlJ3JlIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50XG4gKlxuICogVGhpcyBhbGxvd3MgYXhpb3MgdG8gcnVuIGluIGEgd2ViIHdvcmtlciwgYW5kIHJlYWN0LW5hdGl2ZS5cbiAqIEJvdGggZW52aXJvbm1lbnRzIHN1cHBvcnQgWE1MSHR0cFJlcXVlc3QsIGJ1dCBub3QgZnVsbHkgc3RhbmRhcmQgZ2xvYmFscy5cbiAqXG4gKiB3ZWIgd29ya2VyczpcbiAqICB0eXBlb2Ygd2luZG93IC0+IHVuZGVmaW5lZFxuICogIHR5cGVvZiBkb2N1bWVudCAtPiB1bmRlZmluZWRcbiAqXG4gKiByZWFjdC1uYXRpdmU6XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ1JlYWN0TmF0aXZlJ1xuICogbmF0aXZlc2NyaXB0XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ05hdGl2ZVNjcmlwdCcgb3IgJ05TJ1xuICovXG5mdW5jdGlvbiBpc1N0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIChuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ1JlYWN0TmF0aXZlJyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTmF0aXZlU2NyaXB0JyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTlMnKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gKFxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJ1xuICApO1xufVxuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbiBBcnJheSBvciBhbiBPYmplY3QgaW52b2tpbmcgYSBmdW5jdGlvbiBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmIGBvYmpgIGlzIGFuIEFycmF5IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwgaW5kZXgsIGFuZCBjb21wbGV0ZSBhcnJheSBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmICdvYmonIGlzIGFuIE9iamVjdCBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGtleSwgYW5kIGNvbXBsZXRlIG9iamVjdCBmb3IgZWFjaCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdHxBcnJheX0gb2JqIFRoZSBvYmplY3QgdG8gaXRlcmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGNhbGxiYWNrIHRvIGludm9rZSBmb3IgZWFjaCBpdGVtXG4gKi9cbmZ1bmN0aW9uIGZvckVhY2gob2JqLCBmbikge1xuICAvLyBEb24ndCBib3RoZXIgaWYgbm8gdmFsdWUgcHJvdmlkZWRcbiAgaWYgKG9iaiA9PT0gbnVsbCB8fCB0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEZvcmNlIGFuIGFycmF5IGlmIG5vdCBhbHJlYWR5IHNvbWV0aGluZyBpdGVyYWJsZVxuICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBvYmogPSBbb2JqXTtcbiAgfVxuXG4gIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgYXJyYXkgdmFsdWVzXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvYmoubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBmbi5jYWxsKG51bGwsIG9ialtpXSwgaSwgb2JqKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIG9iamVjdCBrZXlzXG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHtcbiAgICAgICAgZm4uY2FsbChudWxsLCBvYmpba2V5XSwga2V5LCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFjY2VwdHMgdmFyYXJncyBleHBlY3RpbmcgZWFjaCBhcmd1bWVudCB0byBiZSBhbiBvYmplY3QsIHRoZW5cbiAqIGltbXV0YWJseSBtZXJnZXMgdGhlIHByb3BlcnRpZXMgb2YgZWFjaCBvYmplY3QgYW5kIHJldHVybnMgcmVzdWx0LlxuICpcbiAqIFdoZW4gbXVsdGlwbGUgb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIGtleSB0aGUgbGF0ZXIgb2JqZWN0IGluXG4gKiB0aGUgYXJndW1lbnRzIGxpc3Qgd2lsbCB0YWtlIHByZWNlZGVuY2UuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBqc1xuICogdmFyIHJlc3VsdCA9IG1lcmdlKHtmb286IDEyM30sIHtmb286IDQ1Nn0pO1xuICogY29uc29sZS5sb2cocmVzdWx0LmZvbyk7IC8vIG91dHB1dHMgNDU2XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqMSBPYmplY3QgdG8gbWVyZ2VcbiAqIEByZXR1cm5zIHtPYmplY3R9IFJlc3VsdCBvZiBhbGwgbWVyZ2UgcHJvcGVydGllc1xuICovXG5mdW5jdGlvbiBtZXJnZSgvKiBvYmoxLCBvYmoyLCBvYmozLCAuLi4gKi8pIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmIChpc1BsYWluT2JqZWN0KHJlc3VsdFtrZXldKSAmJiBpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2UocmVzdWx0W2tleV0sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2Uoe30sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsLnNsaWNlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsO1xuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGZvckVhY2goYXJndW1lbnRzW2ldLCBhc3NpZ25WYWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBFeHRlbmRzIG9iamVjdCBhIGJ5IG11dGFibHkgYWRkaW5nIHRvIGl0IHRoZSBwcm9wZXJ0aWVzIG9mIG9iamVjdCBiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhIFRoZSBvYmplY3QgdG8gYmUgZXh0ZW5kZWRcbiAqIEBwYXJhbSB7T2JqZWN0fSBiIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIGZyb21cbiAqIEBwYXJhbSB7T2JqZWN0fSB0aGlzQXJnIFRoZSBvYmplY3QgdG8gYmluZCBmdW5jdGlvbiB0b1xuICogQHJldHVybiB7T2JqZWN0fSBUaGUgcmVzdWx0aW5nIHZhbHVlIG9mIG9iamVjdCBhXG4gKi9cbmZ1bmN0aW9uIGV4dGVuZChhLCBiLCB0aGlzQXJnKSB7XG4gIGZvckVhY2goYiwgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAodGhpc0FyZyAmJiB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBhW2tleV0gPSBiaW5kKHZhbCwgdGhpc0FyZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFba2V5XSA9IHZhbDtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gYTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYnl0ZSBvcmRlciBtYXJrZXIuIFRoaXMgY2F0Y2hlcyBFRiBCQiBCRiAodGhlIFVURi04IEJPTSlcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY29udGVudCB3aXRoIEJPTVxuICogQHJldHVybiB7c3RyaW5nfSBjb250ZW50IHZhbHVlIHdpdGhvdXQgQk9NXG4gKi9cbmZ1bmN0aW9uIHN0cmlwQk9NKGNvbnRlbnQpIHtcbiAgaWYgKGNvbnRlbnQuY2hhckNvZGVBdCgwKSA9PT0gMHhGRUZGKSB7XG4gICAgY29udGVudCA9IGNvbnRlbnQuc2xpY2UoMSk7XG4gIH1cbiAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc0FycmF5OiBpc0FycmF5LFxuICBpc0FycmF5QnVmZmVyOiBpc0FycmF5QnVmZmVyLFxuICBpc0J1ZmZlcjogaXNCdWZmZXIsXG4gIGlzRm9ybURhdGE6IGlzRm9ybURhdGEsXG4gIGlzQXJyYXlCdWZmZXJWaWV3OiBpc0FycmF5QnVmZmVyVmlldyxcbiAgaXNTdHJpbmc6IGlzU3RyaW5nLFxuICBpc051bWJlcjogaXNOdW1iZXIsXG4gIGlzT2JqZWN0OiBpc09iamVjdCxcbiAgaXNQbGFpbk9iamVjdDogaXNQbGFpbk9iamVjdCxcbiAgaXNVbmRlZmluZWQ6IGlzVW5kZWZpbmVkLFxuICBpc0RhdGU6IGlzRGF0ZSxcbiAgaXNGaWxlOiBpc0ZpbGUsXG4gIGlzQmxvYjogaXNCbG9iLFxuICBpc0Z1bmN0aW9uOiBpc0Z1bmN0aW9uLFxuICBpc1N0cmVhbTogaXNTdHJlYW0sXG4gIGlzVVJMU2VhcmNoUGFyYW1zOiBpc1VSTFNlYXJjaFBhcmFtcyxcbiAgaXNTdGFuZGFyZEJyb3dzZXJFbnY6IGlzU3RhbmRhcmRCcm93c2VyRW52LFxuICBmb3JFYWNoOiBmb3JFYWNoLFxuICBtZXJnZTogbWVyZ2UsXG4gIGV4dGVuZDogZXh0ZW5kLFxuICB0cmltOiB0cmltLFxuICBzdHJpcEJPTTogc3RyaXBCT01cbn07XG4iLCJpbXBvcnQgeyBjb25maWcgfSBmcm9tICcuLi9jb25maWcnXHJcblxyXG5jbGFzcyBTZWxlY3RhYmxlVGFiRWxzIHtcclxuICBidG46IEVsZW1lbnQgfCB1bmRlZmluZWQ7XHJcbiAgYm9yZGVyQ292ZXI6IEVsZW1lbnQgfCB1bmRlZmluZWQ7XHJcblxyXG4gIHByaXZhdGUgdW5zZWxlY3RFbHMgKCkge1xyXG4gICAgaWYgKHRoaXMuYnRuICYmIHRoaXMuYm9yZGVyQ292ZXIpIHtcclxuICAgICAgdGhpcy5idG4uY2xhc3NMaXN0LnJlbW92ZShjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICAgIHRoaXMuYm9yZGVyQ292ZXIuY2xhc3NMaXN0LnJlbW92ZShjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNlbGVjdEVscyAoKSB7XHJcbiAgICBpZiAodGhpcy5idG4gJiYgdGhpcy5ib3JkZXJDb3Zlcikge1xyXG4gICAgICB0aGlzLmJ0bi5jbGFzc0xpc3QuYWRkKGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZClcclxuICAgICAgdGhpcy5ib3JkZXJDb3Zlci5jbGFzc0xpc3QuYWRkKGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZWxlY3ROZXdUYWIgKGJ0bjogRWxlbWVudCwgYm9yZGVyQ292ZXI6IEVsZW1lbnQpIHtcclxuICAgIC8vIHVuc2VsZWN0IHRoZSBwcmV2aW91cyB0YWJcclxuICAgIHRoaXMudW5zZWxlY3RFbHMoKVxyXG5cclxuICAgIC8vIHJlYXNzaWduIHRoZSBuZXcgdGFiIGVsZW1lbnRzXHJcbiAgICB0aGlzLmJ0biA9IGJ0blxyXG4gICAgdGhpcy5ib3JkZXJDb3ZlciA9IGJvcmRlckNvdmVyXHJcblxyXG4gICAgLy8gc2VsZWN0IHRoZSBuZXcgdGFiXHJcbiAgICB0aGlzLnNlbGVjdEVscygpXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTZWxlY3RhYmxlVGFiRWxzXHJcbiIsImNsYXNzIEFsYnVtIHtcclxuICBuYW1lOiBzdHJpbmc7XHJcbiAgZXh0ZXJuYWxVcmw6IHN0cmluZztcclxuICBjb25zdHJ1Y3RvciAobmFtZTogc3RyaW5nLCBleHRlcm5hbFVybDogc3RyaW5nKSB7XHJcbiAgICB0aGlzLm5hbWUgPSBuYW1lXHJcbiAgICB0aGlzLmV4dGVybmFsVXJsID0gZXh0ZXJuYWxVcmxcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEFsYnVtXHJcbiIsImltcG9ydCB7IGNvbmZpZywgaHRtbFRvRWwsIGdldFZhbGlkSW1hZ2UgfSBmcm9tICcuLi9jb25maWcnXHJcbmltcG9ydCBUcmFjaywgeyBnZW5lcmF0ZVRyYWNrc0Zyb21EYXRhIH0gZnJvbSAnLi90cmFjaydcclxuaW1wb3J0IENhcmQgZnJvbSAnLi9jYXJkJ1xyXG5pbXBvcnQgRG91Ymx5TGlua2VkTGlzdCBmcm9tICcuL2RvdWJseS1saW5rZWQtbGlzdCdcclxuaW1wb3J0IHsgQXJ0aXN0RGF0YSwgU3BvdGlmeUltZyB9IGZyb20gJy4uLy4uL3R5cGVzJ1xyXG5pbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnXHJcblxyXG5jbGFzcyBBcnRpc3QgZXh0ZW5kcyBDYXJkIHtcclxuICBhcnRpc3RJZDogc3RyaW5nO1xyXG4gIG5hbWU6IHN0cmluZztcclxuICBnZW5yZXM6IEFycmF5PHN0cmluZz47XHJcbiAgZm9sbG93ZXJDb3VudDogc3RyaW5nO1xyXG4gIGV4dGVybmFsVXJsOiBzdHJpbmc7XHJcbiAgaW1hZ2VVcmw6IHN0cmluZztcclxuICB0b3BUcmFja3M6IERvdWJseUxpbmtlZExpc3Q8VHJhY2s+IHwgdW5kZWZpbmVkO1xyXG5cclxuICBjb25zdHJ1Y3RvciAoaWQ6IHN0cmluZywgbmFtZTogc3RyaW5nLCBnZW5yZXM6IEFycmF5PHN0cmluZz4sIGZvbGxvd2VyQ291bnQ6IHN0cmluZywgZXh0ZXJuYWxVcmw6IHN0cmluZywgaW1hZ2VzOiBBcnJheTxTcG90aWZ5SW1nPikge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgdGhpcy5hcnRpc3RJZCA9IGlkXHJcbiAgICB0aGlzLm5hbWUgPSBuYW1lXHJcbiAgICB0aGlzLmdlbnJlcyA9IGdlbnJlc1xyXG4gICAgdGhpcy5mb2xsb3dlckNvdW50ID0gZm9sbG93ZXJDb3VudFxyXG4gICAgdGhpcy5leHRlcm5hbFVybCA9IGV4dGVybmFsVXJsXHJcbiAgICB0aGlzLmltYWdlVXJsID0gZ2V0VmFsaWRJbWFnZShpbWFnZXMpXHJcbiAgICB0aGlzLnRvcFRyYWNrcyA9IHVuZGVmaW5lZFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogIFByb2R1Y2VzIHRoZSBjYXJkIGVsZW1lbnQgb2YgdGhpcyBhcnRpc3QuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge051bWJlcn0gaWR4IC0gVGhlIGNhcmQgaW5kZXggdG8gdXNlIGZvciB0aGUgZWxlbWVudHMgaWQgc3VmZml4XHJcbiAgICogQHJldHVybnMge0NoaWxkTm9kZX0gLSBUaGUgY29udmVydGVkIGh0bWwgc3RyaW5nIHRvIGFuIGVsZW1lbnRcclxuICAgKi9cclxuICBnZXRBcnRpc3RIdG1sIChpZHg6IG51bWJlcik6IE5vZGUge1xyXG4gICAgY29uc3QgaWQgPSBgJHtjb25maWcuQ1NTLklEcy5hcnRpc3RQcmVmaXh9JHtpZHh9YFxyXG5cclxuICAgIHRoaXMuY2FyZElkID0gaWRcclxuICAgIGxldCBnZW5yZUxpc3QgPSAnJ1xyXG4gICAgdGhpcy5nZW5yZXMuZm9yRWFjaCgoZ2VucmUpID0+IHtcclxuICAgICAgZ2VucmVMaXN0ICs9ICc8bGk+JyArIGdlbnJlICsgJzwvbGk+J1xyXG4gICAgfSlcclxuXHJcbiAgICBjb25zdCBodG1sID0gYFxyXG4gICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuYXJ0aXN0fSAke2NvbmZpZy5DU1MuQ0xBU1NFUy5mYWRlSW59XCIgaWQ9XCIke3RoaXMuY2FyZElkfVwiPlxyXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuY29udGVudH1cIj5cclxuICAgICAgICAgIDxoZWFkZXIgY2xhc3M9XCJhcnRpc3QtYmFzZVwiPlxyXG4gICAgICAgICAgICA8aW1nIHNyYz0ke3RoaXMuaW1hZ2VVcmx9IGFsdD1cIkFydGlzdFwiLz5cclxuICAgICAgICAgICAgPGgzPiR7dGhpcy5uYW1lfTwvaDM+XHJcbiAgICAgICAgICAgIDx1bCBjbGFzcz1cImdlbnJlc1wiPlxyXG4gICAgICAgICAgICAgICR7Z2VucmVMaXN0fVxyXG4gICAgICAgICAgICA8L3VsPlxyXG4gICAgICAgICAgPC9oZWFkZXI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMudHJhY2tzQXJlYX1cIj5cclxuICAgICAgICAgICAgPHNlY3Rpb24gY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5hcnRpc3RUb3BUcmFja3N9XCI+XHJcbiAgICAgICAgICAgICAgPGhlYWRlcj5cclxuICAgICAgICAgICAgICAgIDxoND5Ub3AgVHJhY2tzPC9oND5cclxuICAgICAgICAgICAgICA8L2hlYWRlcj5cclxuICAgICAgICAgICAgICA8dWwgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5zY3JvbGxCYXJ9ICR7Y29uZmlnLkNTUy5DTEFTU0VTLnRyYWNrTGlzdH1cIj5cclxuICAgICAgICAgICAgICA8L3VsPlxyXG4gICAgICAgICAgICA8L3NlY3Rpb24+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L3NlY3Rpb24+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICBgXHJcbiAgICByZXR1cm4gaHRtbFRvRWwoaHRtbCkgYXMgTm9kZVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUHJvZHVjZXMgdGhlIGNhcmQgZWxlbWVudCBvZiB0aGlzIGFydGlzdC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpZHggLSBUaGUgY2FyZCBpbmRleCB0byB1c2UgZm9yIHRoZSBlbGVtZW50cyBpZCBzdWZmaXhcclxuICAgKiBAcmV0dXJucyB7Q2hpbGROb2RlfSAtIFRoZSBjb252ZXJ0ZWQgaHRtbCBzdHJpbmcgdG8gYW4gZWxlbWVudFxyXG4gICAqL1xyXG4gIGdldEFydGlzdENhcmRIdG1sIChpZHg6IG51bWJlciwgdW5hbmltYXRlZEFwcGVhciA9IGZhbHNlKTogTm9kZSB7XHJcbiAgICBjb25zdCBpZCA9IGAke2NvbmZpZy5DU1MuSURzLmFydGlzdFByZWZpeH0ke2lkeH1gXHJcbiAgICB0aGlzLmNhcmRJZCA9IGlkXHJcbiAgICBjb25zdCBhcHBlYXJDbGFzcyA9IHVuYW5pbWF0ZWRBcHBlYXIgPyBjb25maWcuQ1NTLkNMQVNTRVMuYXBwZWFyIDogJydcclxuICAgIGNvbnN0IGh0bWwgPSBgXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5yYW5rQ2FyZH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLmZhZGVJblxyXG4gICAgfSAke2FwcGVhckNsYXNzfVwiPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5mbGlwQ2FyZH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLm5vU2VsZWN0XHJcbiAgICB9ICAke2NvbmZpZy5DU1MuQ0xBU1NFUy5leHBhbmRPbkhvdmVyfVwiPlxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmNhcmR9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5mbGlwQ2FyZElubmVyXHJcbiAgICB9ICR7Y29uZmlnLkNTUy5DTEFTU0VTLmFydGlzdH1cIiBpZD1cIiR7dGhpcy5nZXRDYXJkSWQoKX1cIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLmZsaXBDYXJkRnJvbnRcclxuICAgICAgICAgICAgICAgICAgfVwiICB0aXRsZT1cIkNsaWNrIHRvIHZpZXcgbW9yZSBJbmZvXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9XCIke3RoaXMuaW1hZ2VVcmx9XCIgYWx0PVwiQWxidW0gQ292ZXJcIj48L2ltZz5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGg0IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMuc2Nyb2xsaW5nVGV4dFxyXG4gICAgfVwiPiR7dGhpcy5uYW1lfTwvaDQ+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSR7Y29uZmlnLkNTUy5DTEFTU0VTLmZsaXBDYXJkQmFja30+XHJcbiAgICAgICAgICAgICAgICAgICAgPGgzPkZvbGxvd2Vyczo8L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgIDxwPiR7dGhpcy5mb2xsb3dlckNvdW50fTwvcD5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICBgXHJcbiAgICByZXR1cm4gaHRtbFRvRWwoaHRtbCkgYXMgTm9kZVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgbG9hZFRvcFRyYWNrcyAoKSB7XHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBheGlvcy5nZXQoY29uZmlnLlVSTHMuZ2V0QXJ0aXN0VG9wVHJhY2tzKHRoaXMuYXJ0aXN0SWQpKVxyXG4gICAgY29uc3QgdHJhY2tzRGF0YSA9IHJlcy5kYXRhLnRyYWNrc1xyXG4gICAgY29uc3QgdHJhY2tPYmpzID0gbmV3IERvdWJseUxpbmtlZExpc3Q8VHJhY2s+KClcclxuXHJcbiAgICBnZW5lcmF0ZVRyYWNrc0Zyb21EYXRhKHRyYWNrc0RhdGEsIHRyYWNrT2JqcylcclxuXHJcbiAgICB0aGlzLnRvcFRyYWNrcyA9IHRyYWNrT2Jqc1xyXG4gICAgcmV0dXJuIHRyYWNrT2Jqc1xyXG4gIH1cclxuXHJcbiAgaGFzTG9hZGVkVG9wVHJhY2tzICgpIHtcclxuICAgIHJldHVybiB0aGlzLnRvcFRyYWNrcyAhPT0gdW5kZWZpbmVkXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVBcnRpc3RzRnJvbURhdGEgKGRhdGFzOiBBcnJheTxBcnRpc3REYXRhPiwgYXJ0aXN0QXJyOiBBcnJheTxBcnRpc3Q+KSB7XHJcbiAgZGF0YXMuZm9yRWFjaCgoZGF0YTogQXJ0aXN0RGF0YSkgPT4ge1xyXG4gICAgYXJ0aXN0QXJyLnB1c2goXHJcbiAgICAgIG5ldyBBcnRpc3QoXHJcbiAgICAgICAgZGF0YS5pZCxcclxuICAgICAgICBkYXRhLm5hbWUsXHJcbiAgICAgICAgZGF0YS5nZW5yZXMsXHJcbiAgICAgICAgZGF0YS5mb2xsb3dlcnMudG90YWwsXHJcbiAgICAgICAgZGF0YS5leHRlcm5hbF91cmxzLnNwb3RpZnksXHJcbiAgICAgICAgZGF0YS5pbWFnZXNcclxuICAgICAgKVxyXG4gICAgKVxyXG4gIH0pXHJcbiAgcmV0dXJuIGFydGlzdEFyclxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBcnRpc3RcclxuIiwiY2xhc3MgQXN5bmNTZWxlY3Rpb25WZXJpZjxUPiB7XHJcbiAgcHJpdmF0ZSBfY3VyclNlbGVjdGVkVmFsOiBUIHwgbnVsbDtcclxuICBoYXNMb2FkZWRDdXJyU2VsZWN0ZWQ6IGJvb2xlYW47XHJcblxyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIHRoaXMuX2N1cnJTZWxlY3RlZFZhbCA9IG51bGxcclxuXHJcbiAgICAvLyB1c2VkIHRvIGVuc3VyZSB0aGF0IGFuIG9iamVjdCB0aGF0IGhhcyBsb2FkZWQgd2lsbCBub3QgYmUgbG9hZGVkIGFnYWluXHJcbiAgICB0aGlzLmhhc0xvYWRlZEN1cnJTZWxlY3RlZCA9IGZhbHNlXHJcbiAgfVxyXG5cclxuICBnZXQgY3VyclNlbGVjdGVkVmFsTm9OdWxsICgpOiBUIHtcclxuICAgIGlmICghdGhpcy5fY3VyclNlbGVjdGVkVmFsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ3VycmVudGx5IHNlbGVjdGVkIHZhbHVlIGlzIGFjY2Vzc2VkIHdpdGhvdXQgYmVpbmcgYXNzaWduZWQnKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX2N1cnJTZWxlY3RlZFZhbFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZ2V0IGN1cnJTZWxlY3RlZFZhbCAoKTogVCB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuX2N1cnJTZWxlY3RlZFZhbFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hhbmdlIHRoZSB2YWx1ZSBvZiB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGFuZCByZXNldCB0aGUgaGFzIGxvYWRlZCBib29sZWFuLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtUfSBjdXJyU2VsZWN0ZWRWYWwgdGhlIHZhbHVlIHRvIGNoYW5nZSB0aGUgY3VycmVudGx5IHNlbGVjdGVkIHZhbHVlIHRvby5cclxuICAgKi9cclxuICBzZWxlY3Rpb25DaGFuZ2VkIChjdXJyU2VsZWN0ZWRWYWw6IFQpIHtcclxuICAgIHRoaXMuX2N1cnJTZWxlY3RlZFZhbCA9IGN1cnJTZWxlY3RlZFZhbFxyXG4gICAgdGhpcy5oYXNMb2FkZWRDdXJyU2VsZWN0ZWQgPSBmYWxzZVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2tzIHRvIHNlZSBpZiBhIHNlbGVjdGVkIHZhbHVlIHBvc3QgbG9hZCBpcyB2YWxpZCBieVxyXG4gICAqIGNvbXBhcmluZyBpdCB0byB0aGUgY3VycmVudGx5IHNlbGVjdGVkIHZhbHVlIGFuZCB2ZXJpZnlpbmcgdGhhdFxyXG4gICAqIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgaGFzIG5vdCBhbHJlYWR5IGJlZW4gbG9hZGVkLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtUfSBwb3N0TG9hZFZhbCBkYXRhIHRoYXQgaGFzIGJlZW4gbG9hZGVkXHJcbiAgICogQHJldHVybnMge0Jvb2xlYW59IHdoZXRoZXIgdGhlIGxvYWRlZCBzZWxlY3Rpb24gaXMgdmFsaWRcclxuICAgKi9cclxuICBpc1ZhbGlkIChwb3N0TG9hZFZhbDogVCk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKHRoaXMuX2N1cnJTZWxlY3RlZFZhbCAhPT0gcG9zdExvYWRWYWwgfHwgdGhpcy5oYXNMb2FkZWRDdXJyU2VsZWN0ZWQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBpZiBpcyB2YWxpZCB0aGVuIHdlIGFzc3VtZSB0aGF0IHRoaXMgdmFsdWUgd2lsbCBiZSBsb2FkZWRcclxuICAgICAgdGhpcy5oYXNMb2FkZWRDdXJyU2VsZWN0ZWQgPSB0cnVlXHJcbiAgICAgIHJldHVybiB0cnVlXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBc3luY1NlbGVjdGlvblZlcmlmXHJcbiIsImNsYXNzIENhcmQge1xyXG4gIGNhcmRJZDogc3RyaW5nO1xyXG5cclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICB0aGlzLmNhcmRJZCA9ICcnXHJcbiAgfVxyXG5cclxuICBnZXRDYXJkSWQgKCkge1xyXG4gICAgaWYgKHRoaXMuY2FyZElkID09PSAnbnVsbCcpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYXJkIGlkIHdhcyBhc2tpbmcgdG8gYmUgcmV0cmlldmVkIGJ1dCBpcyBudWxsJylcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmNhcmRJZFxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ2FyZFxyXG4iLCIvKiBDb3B5cmlnaHQgKGMpIDIwMDkgTmljaG9sYXMgQy4gWmFrYXMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuICovXHJcblxyXG4vKipcclxuICogUmVwcmVzZW50cyBhIHNpbmdsZSBub2RlIGluIGEgRG91Ymx5TGlua2VkTGlzdC5cclxuICogQGNsYXNzIERvdWJseUxpbmtlZExpc3ROb2RlXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4ge1xyXG4gIGRhdGE6IFQ7XHJcbiAgbmV4dDogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBudWxsXHJcbiAgcHJldmlvdXM6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgbnVsbFxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIERvdWJseUxpbmtlZExpc3ROb2RlLlxyXG4gICAqIEBwYXJhbSB7Kn0gZGF0YSBUaGUgZGF0YSB0byBzdG9yZSBpbiB0aGUgbm9kZS5cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciAoZGF0YTogVCkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZGF0YSB0aGF0IHRoaXMgbm9kZSBzdG9yZXMuXHJcbiAgICAgKiBAcHJvcGVydHkgZGF0YVxyXG4gICAgICogQHR5cGUgKlxyXG4gICAgICovXHJcbiAgICB0aGlzLmRhdGEgPSBkYXRhXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBIHBvaW50ZXIgdG8gdGhlIG5leHQgbm9kZSBpbiB0aGUgRG91Ymx5TGlua2VkTGlzdC5cclxuICAgICAqIEBwcm9wZXJ0eSBuZXh0XHJcbiAgICAgKiBAdHlwZSA/RG91Ymx5TGlua2VkTGlzdE5vZGVcclxuICAgICAqL1xyXG4gICAgdGhpcy5uZXh0ID0gbnVsbFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQSBwb2ludGVyIHRvIHRoZSBwcmV2aW91cyBub2RlIGluIHRoZSBEb3VibHlMaW5rZWRMaXN0LlxyXG4gICAgICogQHByb3BlcnR5IHByZXZpb3VzXHJcbiAgICAgKiBAdHlwZSA/RG91Ymx5TGlua2VkTGlzdE5vZGVcclxuICAgICAqL1xyXG4gICAgdGhpcy5wcmV2aW91cyA9IG51bGxcclxuICB9XHJcbn1cclxuLyoqXHJcbiAqIEEgZG91Ymx5IGxpbmtlZCBsaXN0IGltcGxlbWVudGF0aW9uIGluIEphdmFTY3JpcHQuXHJcbiAqIEBjbGFzcyBEb3VibHlMaW5rZWRMaXN0XHJcbiAqL1xyXG5jbGFzcyBEb3VibHlMaW5rZWRMaXN0PFQ+IHtcclxuICBoZWFkOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGxcclxuICB0YWlsOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGxcclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIERvdWJseUxpbmtlZExpc3RcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICAvLyBwb2ludGVyIHRvIGZpcnN0IG5vZGUgaW4gdGhlIGxpc3RcclxuICAgIHRoaXMuaGVhZCA9IG51bGxcclxuXHJcbiAgICAvLyBwb2ludGVyIHRvIGxhc3Qgbm9kZSBpbiB0aGUgbGlzdCB3aGljaCBwb2ludHMgdG8gbnVsbFxyXG4gICAgdGhpcy50YWlsID0gbnVsbFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQXBwZW5kcyBzb21lIGRhdGEgdG8gdGhlIGVuZCBvZiB0aGUgbGlzdC5cclxuICAgKiBAcGFyYW0ge1R9IGRhdGEgVGhlIGRhdGEgdG8gYWRkIHRvIHRoZSBsaXN0LlxyXG4gICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAqL1xyXG4gIGFkZCAoZGF0YTogVCk6IHZvaWQge1xyXG4gICAgLypcclxuICAgICAqIENyZWF0ZSBhIG5ldyBsaXN0IG5vZGUgb2JqZWN0IGFuZCBzdG9yZSB0aGUgZGF0YSBpbiBpdC5cclxuICAgICAqIFRoaXMgbm9kZSB3aWxsIGJlIGFkZGVkIHRvIHRoZSBlbmQgb2YgdGhlIGV4aXN0aW5nIGxpc3QuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IG5ld05vZGUgPSBuZXcgRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4oZGF0YSlcclxuXHJcbiAgICAvLyBzcGVjaWFsIGNhc2U6IG5vIG5vZGVzIGluIHRoZSBsaXN0IHlldFxyXG4gICAgaWYgKHRoaXMuaGVhZCA9PT0gbnVsbCkge1xyXG4gICAgICAvKlxyXG4gICAgICAgKiBCZWNhdXNlIHRoZXJlIGFyZSBubyBub2RlcyBpbiB0aGUgbGlzdCwganVzdCBzZXQgdGhlXHJcbiAgICAgICAqIGB0aGlzLmhlYWRgIHBvaW50ZXIgdG8gdGhlIG5ldyBub2RlLlxyXG4gICAgICAgKi9cclxuICAgICAgdGhpcy5oZWFkID0gbmV3Tm9kZVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLypcclxuICAgICAgICogVW5saWtlIGluIGEgc2luZ2x5IGxpbmtlZCBsaXN0LCB3ZSBoYXZlIGEgZGlyZWN0IHJlZmVyZW5jZSB0b1xyXG4gICAgICAgKiB0aGUgbGFzdCBub2RlIGluIHRoZSBsaXN0LiBTZXQgdGhlIGBuZXh0YCBwb2ludGVyIG9mIHRoZVxyXG4gICAgICAgKiBjdXJyZW50IGxhc3Qgbm9kZSB0byBgbmV3Tm9kZWAgaW4gb3JkZXIgdG8gYXBwZW5kIHRoZSBuZXcgZGF0YVxyXG4gICAgICAgKiB0byB0aGUgZW5kIG9mIHRoZSBsaXN0LiBUaGVuLCBzZXQgYG5ld05vZGUucHJldmlvdXNgIHRvIHRoZSBjdXJyZW50XHJcbiAgICAgICAqIHRhaWwgdG8gZW5zdXJlIGJhY2t3YXJkcyB0cmFja2luZyB3b3JrLlxyXG4gICAgICAgKi9cclxuICAgICAgaWYgKHRoaXMudGFpbCAhPT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMudGFpbC5uZXh0ID0gbmV3Tm9kZVxyXG4gICAgICB9XHJcbiAgICAgIG5ld05vZGUucHJldmlvdXMgPSB0aGlzLnRhaWxcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogTGFzdCwgcmVzZXQgYHRoaXMudGFpbGAgdG8gYG5ld05vZGVgIHRvIGVuc3VyZSB3ZSBhcmUgc3RpbGxcclxuICAgICAqIHRyYWNraW5nIHRoZSBsYXN0IG5vZGUgY29ycmVjdGx5LlxyXG4gICAgICovXHJcbiAgICB0aGlzLnRhaWwgPSBuZXdOb2RlXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbnNlcnRzIHNvbWUgZGF0YSBpbnRvIHRoZSBtaWRkbGUgb2YgdGhlIGxpc3QuIFRoaXMgbWV0aG9kIHRyYXZlcnNlc1xyXG4gICAqIHRoZSBleGlzdGluZyBsaXN0IGFuZCBwbGFjZXMgdGhlIGRhdGEgaW4gYSBuZXcgbm9kZSBhdCBhIHNwZWNpZmljIGluZGV4LlxyXG4gICAqIEBwYXJhbSB7VH0gZGF0YSBUaGUgZGF0YSB0byBhZGQgdG8gdGhlIGxpc3QuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IFRoZSB6ZXJvLWJhc2VkIGluZGV4IGF0IHdoaWNoIHRvIGluc2VydCB0aGUgZGF0YS5cclxuICAgKiBAcmV0dXJucyB7dm9pZH1cclxuICAgKiBAdGhyb3dzIHtSYW5nZUVycm9yfSBJZiB0aGUgaW5kZXggZG9lc24ndCBleGlzdCBpbiB0aGUgbGlzdC5cclxuICAgKi9cclxuICBpbnNlcnRCZWZvcmUgKGRhdGE6IFQsIGluZGV4OiBudW1iZXIpOiB2b2lkIHtcclxuICAgIC8qXHJcbiAgICAgKiBDcmVhdGUgYSBuZXcgbGlzdCBub2RlIG9iamVjdCBhbmQgc3RvcmUgdGhlIGRhdGEgaW4gaXQuXHJcbiAgICAgKiBUaGlzIG5vZGUgd2lsbCBiZSBpbnNlcnRlZCBpbnRvIHRoZSBleGlzdGluZyBsaXN0LlxyXG4gICAgICovXHJcbiAgICBjb25zdCBuZXdOb2RlID0gbmV3IERvdWJseUxpbmtlZExpc3ROb2RlKGRhdGEpXHJcblxyXG4gICAgLy8gc3BlY2lhbCBjYXNlOiBubyBub2RlcyBpbiB0aGUgbGlzdCB5ZXRcclxuICAgIGlmICh0aGlzLmhlYWQgPT09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYEluZGV4ICR7aW5kZXh9IGRvZXMgbm90IGV4aXN0IGluIHRoZSBsaXN0LmApXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIFNwZWNpYWwgY2FzZTogaWYgYGluZGV4YCBpcyBgMGAsIHRoZW4gbm8gdHJhdmVyc2FsIGlzIG5lZWRlZFxyXG4gICAgICogYW5kIHdlIG5lZWQgdG8gdXBkYXRlIGB0aGlzLmhlYWRgIHRvIHBvaW50IHRvIGBuZXdOb2RlYC5cclxuICAgICAqL1xyXG4gICAgaWYgKGluZGV4ID09PSAwKSB7XHJcbiAgICAgIC8qXHJcbiAgICAgICAqIEVuc3VyZSB0aGUgbmV3IG5vZGUncyBgbmV4dGAgcHJvcGVydHkgaXMgcG9pbnRlZCB0byB0aGUgY3VycmVudFxyXG4gICAgICAgKiBoZWFkLlxyXG4gICAgICAgKi9cclxuICAgICAgbmV3Tm9kZS5uZXh0ID0gdGhpcy5oZWFkXHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBUaGUgY3VycmVudCBoZWFkJ3MgYHByZXZpb3VzYCBwcm9wZXJ0eSBuZWVkcyB0byBwb2ludCB0byB0aGUgbmV3XHJcbiAgICAgICAqIG5vZGUgdG8gZW5zdXJlIHRoZSBsaXN0IGlzIHRyYXZlcnNhYmxlIGJhY2t3YXJkcy5cclxuICAgICAgICovXHJcbiAgICAgIHRoaXMuaGVhZC5wcmV2aW91cyA9IG5ld05vZGVcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIE5vdyBpdCdzIHNhZmUgdG8gc2V0IGB0aGlzLmhlYWRgIHRvIHRoZSBuZXcgbm9kZSwgZWZmZWN0aXZlbHlcclxuICAgICAgICogbWFraW5nIHRoZSBuZXcgbm9kZSB0aGUgZmlyc3Qgbm9kZSBpbiB0aGUgbGlzdC5cclxuICAgICAgICovXHJcbiAgICAgIHRoaXMuaGVhZCA9IG5ld05vZGVcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayB0aGUgbm9kZSB0aGF0IGlzIGJlaW5nXHJcbiAgICAgICAqIHVzZWQgaW5zaWRlIG9mIHRoZSBsb29wIGJlbG93LiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvXHJcbiAgICAgICAqIGB0aGlzLmhlYWRgIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGUgb2YgdGhlIGxvb3AuXHJcbiAgICAgICAqL1xyXG4gICAgICBsZXQgY3VycmVudCA9IHRoaXMuaGVhZFxyXG5cclxuICAgICAgLypcclxuICAgICAgICogVGhlIGBpYCB2YXJpYWJsZSBpcyB1c2VkIHRvIHRyYWNrIGhvdyBkZWVwIGludG8gdGhlIGxpc3Qgd2UndmVcclxuICAgICAgICogZ29uZS4gVGhpcyBpbXBvcnRhbnQgYmVjYXVzZSBpdCdzIHRoZSBvbmx5IHdheSB0byBrbm93IHdoZW5cclxuICAgICAgICogd2UndmUgaGl0IHRoZSBgaW5kZXhgIHRvIGluc2VydCBpbnRvLlxyXG4gICAgICAgKi9cclxuICAgICAgbGV0IGkgPSAwXHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBUcmF2ZXJzZSB0aGUgbGlzdCBub2RlcyB1c2luZyBgbmV4dGAgcG9pbnRlcnMsIGFuZCBtYWtlXHJcbiAgICAgICAqIHN1cmUgdG8ga2VlcCB0cmFjayBvZiBob3cgbWFueSBub2RlcyBoYXZlIGJlZW4gdmlzaXRlZC4gV2hlblxyXG4gICAgICAgKiBgaWAgaXMgdGhlIHNhbWUgYXMgYGluZGV4YCwgaXQgbWVhbnMgd2UndmUgZm91bmQgdGhlIGxvY2F0aW9uIHRvXHJcbiAgICAgICAqIGluc2VydCB0aGUgbmV3IGRhdGEuXHJcbiAgICAgICAqL1xyXG4gICAgICB3aGlsZSAoY3VycmVudC5uZXh0ICE9PSBudWxsICYmIGkgPCBpbmRleCkge1xyXG4gICAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRcclxuICAgICAgICBpKytcclxuICAgICAgfVxyXG5cclxuICAgICAgLypcclxuICAgICAgICogQXQgdGhpcyBwb2ludCwgYGN1cnJlbnRgIGlzIGVpdGhlciB0aGUgbm9kZSB0byBpbnNlcnQgdGhlIG5ldyBkYXRhXHJcbiAgICAgICAqIGJlZm9yZSwgb3IgdGhlIGxhc3Qgbm9kZSBpbiB0aGUgbGlzdC4gVGhlIG9ubHkgd2F5IHRvIHRlbGwgaXMgaWZcclxuICAgICAgICogYGlgIGlzIHN0aWxsIGxlc3MgdGhhbiBgaW5kZXhgLCB0aGF0IG1lYW5zIHRoZSBpbmRleCBpcyBvdXQgb2YgcmFuZ2VcclxuICAgICAgICogYW5kIGFuIGVycm9yIHNob3VsZCBiZSB0aHJvd24uXHJcbiAgICAgICAqL1xyXG4gICAgICBpZiAoaSA8IGluZGV4KSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYEluZGV4ICR7aW5kZXh9IGRvZXMgbm90IGV4aXN0IGluIHRoZSBsaXN0LmApXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIElmIGNvZGUgY29udGludWVzIHRvIGV4ZWN1dGUgaGVyZSwgaXQgbWVhbnMgYGN1cnJlbnRgIGlzIHRoZSBub2RlXHJcbiAgICAgICAqIHRvIGluc2VydCBuZXcgZGF0YSBiZWZvcmUuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEZpcnN0LCBpbnNlcnQgYG5ld05vZGVgIGFmdGVyIGBjdXJyZW50LnByZXZpb3VzYCBieSB1cGRhdGluZ1xyXG4gICAgICAgKiBgY3VycmVudC5wcmV2aW91cy5uZXh0YCBhbmQgYG5ld05vZGUucHJldmlvdXNgLlxyXG4gICAgICAgKi9cclxuICAgICAgY3VycmVudCEucHJldmlvdXMhLm5leHQgPSBuZXdOb2RlXHJcbiAgICAgIG5ld05vZGUhLnByZXZpb3VzID0gY3VycmVudC5wcmV2aW91c1xyXG5cclxuICAgICAgLypcclxuICAgICAgICogTmV4dCwgaW5zZXJ0IGBjdXJyZW50YCBhZnRlciBgbmV3Tm9kZWAgYnkgdXBkYXRpbmcgYG5ld05vZGUubmV4dGAgYW5kXHJcbiAgICAgICAqIGBjdXJyZW50LnByZXZpb3VzYC5cclxuICAgICAgICovXHJcbiAgICAgIG5ld05vZGUubmV4dCA9IGN1cnJlbnRcclxuICAgICAgY3VycmVudC5wcmV2aW91cyA9IG5ld05vZGVcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEluc2VydHMgc29tZSBkYXRhIGludG8gdGhlIG1pZGRsZSBvZiB0aGUgbGlzdC4gVGhpcyBtZXRob2QgdHJhdmVyc2VzXHJcbiAgICogdGhlIGV4aXN0aW5nIGxpc3QgYW5kIHBsYWNlcyB0aGUgZGF0YSBpbiBhIG5ldyBub2RlIGFmdGVyIGEgc3BlY2lmaWMgaW5kZXguXHJcbiAgICogQHBhcmFtIHsqfSBkYXRhIFRoZSBkYXRhIHRvIGFkZCB0byB0aGUgbGlzdC5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggVGhlIHplcm8tYmFzZWQgaW5kZXggYWZ0ZXIgd2hpY2ggdG8gaW5zZXJ0IHRoZSBkYXRhLlxyXG4gICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAqIEB0aHJvd3Mge1JhbmdlRXJyb3J9IElmIHRoZSBpbmRleCBkb2Vzbid0IGV4aXN0IGluIHRoZSBsaXN0LlxyXG4gICAqL1xyXG4gIGluc2VydEFmdGVyIChkYXRhOiBULCBpbmRleDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAvKlxyXG4gICAgICogQ3JlYXRlIGEgbmV3IGxpc3Qgbm9kZSBvYmplY3QgYW5kIHN0b3JlIHRoZSBkYXRhIGluIGl0LlxyXG4gICAgICogVGhpcyBub2RlIHdpbGwgYmUgaW5zZXJ0ZWQgaW50byB0aGUgZXhpc3RpbmcgbGlzdC5cclxuICAgICAqL1xyXG4gICAgY29uc3QgbmV3Tm9kZSA9IG5ldyBEb3VibHlMaW5rZWRMaXN0Tm9kZShkYXRhKVxyXG5cclxuICAgIC8vIHNwZWNpYWwgY2FzZTogbm8gbm9kZXMgaW4gdGhlIGxpc3QgeWV0XHJcbiAgICBpZiAodGhpcy5oZWFkID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBJbmRleCAke2luZGV4fSBkb2VzIG5vdCBleGlzdCBpbiB0aGUgbGlzdC5gKVxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gdHJhY2sgdGhlIG5vZGUgdGhhdCBpcyBiZWluZ1xyXG4gICAgICogdXNlZCBpbnNpZGUgb2YgdGhlIGxvb3AgYmVsb3cuIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG9cclxuICAgICAqIGB0aGlzLmhlYWRgIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGUgb2YgdGhlIGxvb3AuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50OiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGwgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBpYCB2YXJpYWJsZSBpcyB1c2VkIHRvIHRyYWNrIGhvdyBkZWVwIGludG8gdGhlIGxpc3Qgd2UndmVcclxuICAgICAqIGdvbmUuIFRoaXMgaW1wb3J0YW50IGJlY2F1c2UgaXQncyB0aGUgb25seSB3YXkgdG8ga25vdyB3aGVuXHJcbiAgICAgKiB3ZSd2ZSBoaXQgdGhlIGBpbmRleGAgdG8gaW5zZXJ0IGludG8uXHJcbiAgICAgKi9cclxuICAgIGxldCBpID0gMFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUcmF2ZXJzZSB0aGUgbGlzdCBub2RlcyBzaW1pbGFyIHRvIHRoZSBgYWRkKClgIG1ldGhvZCwgYnV0IG1ha2VcclxuICAgICAqIHN1cmUgdG8ga2VlcCB0cmFjayBvZiBob3cgbWFueSBub2RlcyBoYXZlIGJlZW4gdmlzaXRlZCBhbmQgdXBkYXRlXHJcbiAgICAgKiB0aGUgYHByZXZpb3VzYCBwb2ludGVyIGluIGFkZGl0aW9uIHRvIGBjdXJyZW50YC4gV2hlblxyXG4gICAgICogYGlgIGlzIHRoZSBzYW1lIGFzIGBpbmRleGAsIGl0IG1lYW5zIHdlJ3ZlIGZvdW5kIHRoZSBsb2NhdGlvbiB0b1xyXG4gICAgICogaW5zZXJ0IHRoZSBuZXcgZGF0YS5cclxuICAgICAqL1xyXG4gICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwgJiYgaSA8IGluZGV4KSB7XHJcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRcclxuICAgICAgaSsrXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIEF0IHRoaXMgcG9pbnQsIGBjdXJyZW50YCBpcyBlaXRoZXIgdGhlIG5vZGUgdG8gaW5zZXJ0IHRoZSBuZXcgZGF0YVxyXG4gICAgICogYmVmb3JlLCBvciB0aGUgbGFzdCBub2RlIGluIHRoZSBsaXN0LiBUaGUgb25seSB3YXkgdG8gdGVsbCBpcyBpZlxyXG4gICAgICogYGlgIGlzIHN0aWxsIGxlc3MgdGhhbiBgaW5kZXhgLCB0aGF0IG1lYW5zIHRoZSBpbmRleCBpcyBvdXQgb2YgcmFuZ2VcclxuICAgICAqIGFuZCBhbiBlcnJvciBzaG91bGQgYmUgdGhyb3duLlxyXG4gICAgICovXHJcbiAgICBpZiAoaSA8IGluZGV4KSB7XHJcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBJbmRleCAke2luZGV4fSBkb2VzIG5vdCBleGlzdCBpbiB0aGUgbGlzdC5gKVxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBJZiBjb2RlIGNvbnRpbnVlcyB0byBleGVjdXRlIGhlcmUsIGl0IG1lYW5zIGBjdXJyZW50YCBpcyB0aGUgbm9kZVxyXG4gICAgICogdG8gaW5zZXJ0IG5ldyBkYXRhIGFmdGVyLlxyXG4gICAgICovXHJcblxyXG4gICAgLy8gc3BlY2lhbCBjYXNlOiBgY3VycmVudGAgaXMgdGhlIHRhaWwsIHNvIHJlc2V0IGB0aGlzLnRhaWxgXHJcbiAgICBpZiAodGhpcy50YWlsID09PSBjdXJyZW50KSB7XHJcbiAgICAgIHRoaXMudGFpbCA9IG5ld05vZGVcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8qXHJcbiAgICAgICAqIE90aGVyd2lzZSwgaW5zZXJ0IGBuZXdOb2RlYCBiZWZvcmUgYGN1cnJlbnQubmV4dGAgYnkgdXBkYXRpbmdcclxuICAgICAgICogYGN1cnJlbnQubmV4dC5wcmV2aW91c2AgYW5kIGBuZXdOb2RlLm5vZGVgLlxyXG4gICAgICAgKi9cclxuICAgICAgY3VycmVudCEubmV4dCEucHJldmlvdXMgPSBuZXdOb2RlXHJcbiAgICAgIG5ld05vZGUubmV4dCA9IGN1cnJlbnQhLm5leHRcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogTmV4dCwgaW5zZXJ0IGBuZXdOb2RlYCBhZnRlciBgY3VycmVudGAgYnkgdXBkYXRpbmcgYG5ld05vZGUucHJldmlvdXNgIGFuZFxyXG4gICAgICogYGN1cnJlbnQubmV4dGAuXHJcbiAgICAgKi9cclxuICAgIG5ld05vZGUucHJldmlvdXMgPSBjdXJyZW50XHJcbiAgICBjdXJyZW50IS5uZXh0ID0gbmV3Tm9kZVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0cmlldmVzIHRoZSBkYXRhIGluIHRoZSBnaXZlbiBwb3NpdGlvbiBpbiB0aGUgbGlzdC5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggVGhlIHplcm8tYmFzZWQgaW5kZXggb2YgdGhlIG5vZGUgd2hvc2UgZGF0YVxyXG4gICAqICAgICAgc2hvdWxkIGJlIHJldHVybmVkLlxyXG4gICAqIEByZXR1cm5zIHsqfSBUaGUgZGF0YSBpbiB0aGUgXCJkYXRhXCIgcG9ydGlvbiBvZiB0aGUgZ2l2ZW4gbm9kZVxyXG4gICAqICAgICAgb3IgdW5kZWZpbmVkIGlmIHRoZSBub2RlIGRvZXNuJ3QgZXhpc3QuXHJcbiAgICovXHJcbiAgZ2V0IChpbmRleDogbnVtYmVyKTogVCB7XHJcbiAgICAvLyBlbnN1cmUgYGluZGV4YCBpcyBhIHBvc2l0aXZlIHZhbHVlXHJcbiAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAvKlxyXG4gICAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gdHJhY2sgdGhlIG5vZGUgdGhhdCBpcyBiZWluZ1xyXG4gICAgICAgKiB1c2VkIGluc2lkZSBvZiB0aGUgbG9vcCBiZWxvdy4gSXQgc3RhcnRzIG91dCBwb2ludGluZyB0b1xyXG4gICAgICAgKiBgdGhpcy5oZWFkYCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlIG9mIHRoZSBsb29wLlxyXG4gICAgICAgKi9cclxuICAgICAgbGV0IGN1cnJlbnQgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFRoZSBgaWAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayBob3cgZGVlcCBpbnRvIHRoZSBsaXN0IHdlJ3ZlXHJcbiAgICAgICAqIGdvbmUuIFRoaXMgaXMgaW1wb3J0YW50IGJlY2F1c2UgaXQncyB0aGUgb25seSB3YXkgdG8ga25vdyB3aGVuXHJcbiAgICAgICAqIHdlJ3ZlIGhpdCB0aGUgYGluZGV4YCB0byBpbnNlcnQgaW50by5cclxuICAgICAgICovXHJcbiAgICAgIGxldCBpID0gMFxyXG5cclxuICAgICAgLypcclxuICAgICAgICogVHJhdmVyc2UgdGhlIGxpc3Qgbm9kZXMsIGJ1dCBtYWtlIHN1cmUgdG8ga2VlcCB0cmFjayBvZiBob3cgbWFueVxyXG4gICAgICAgKiBub2RlcyBoYXZlIGJlZW4gdmlzaXRlZCBhbmQgdXBkYXRlIHRoZSBgcHJldmlvdXNgIHBvaW50ZXIgaW5cclxuICAgICAgICogYWRkaXRpb24gdG8gYGN1cnJlbnRgLiBXaGVuIGBpYCBpcyB0aGUgc2FtZSBhcyBgaW5kZXhgLCBpdCBtZWFuc1xyXG4gICAgICAgKiB3ZSd2ZSBmb3VuZCB0aGUgbG9jYXRpb24gdG8gaW5zZXJ0IHRoZSBuZXcgZGF0YS5cclxuICAgICAgICovXHJcbiAgICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsICYmIGkgPCBpbmRleCkge1xyXG4gICAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRcclxuICAgICAgICBpKytcclxuICAgICAgfVxyXG5cclxuICAgICAgLypcclxuICAgICAgICogQXQgdGhpcyBwb2ludCwgYGN1cnJlbnRgIG1pZ2h0IGJlIG51bGwgaWYgd2UndmUgZ29uZSBwYXN0IHRoZVxyXG4gICAgICAgKiBlbmQgb2YgdGhlIGxpc3QuIEluIHRoYXQgY2FzZSwgd2UgcmV0dXJuIGB1bmRlZmluZWRgIHRvIGluZGljYXRlXHJcbiAgICAgICAqIHRoYXQgdGhlIG5vZGUgYXQgYGluZGV4YCB3YXMgbm90IGZvdW5kLiBJZiBgY3VycmVudGAgaXMgbm90XHJcbiAgICAgICAqIGBudWxsYCwgdGhlbiBpdCdzIHNhZmUgdG8gcmV0dXJuIGBjdXJyZW50LmRhdGFgLlxyXG4gICAgICAgKi9cclxuICAgICAgaWYgKGN1cnJlbnQgIT09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gY3VycmVudC5kYXRhXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYGluZGV4ICR7aW5kZXh9IG91dCBvZiByYW5nZWApXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBpbmRleCAke2luZGV4fSBvdXQgb2YgcmFuZ2VgKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0cmlldmVzIHRoZSBpbmRleCBvZiB0aGUgZGF0YSBpbiB0aGUgbGlzdC5cclxuICAgKiBAcGFyYW0ge1R9IGRhdGEgVGhlIGRhdGEgdG8gc2VhcmNoIGZvci5cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgaW5kZXggb2YgdGhlIGZpcnN0IGluc3RhbmNlIG9mIHRoZSBkYXRhIGluIHRoZSBsaXN0XHJcbiAgICogICAgICBvciAtMSBpZiBub3QgZm91bmQuXHJcbiAgICovXHJcbiAgaW5kZXhPZiAoZGF0YTogVCk6IG51bWJlciB7XHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBub2Rlcy5cclxuICAgICAqIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG8gdGhlIGhlYWQgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZVxyXG4gICAgICogb2YgdGhlIGxvb3AgYmVsb3cuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50OiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGwgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBpbmRleGAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayBob3cgZGVlcCBpbnRvIHRoZSBsaXN0IHdlJ3ZlXHJcbiAgICAgKiBnb25lLiBUaGlzIGlzIGltcG9ydGFudCBiZWNhdXNlIHRoaXMgaXMgdGhlIHZhbHVlIHRoYXQgaXMgcmV0dXJuZWRcclxuICAgICAqIGZyb20gdGhpcyBtZXRob2QuXHJcbiAgICAgKi9cclxuICAgIGxldCBpbmRleCA9IDBcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhpcyBsb29wIGNoZWNrcyBlYWNoIG5vZGUgaW4gdGhlIGxpc3QgdG8gc2VlIGlmIGl0IG1hdGNoZXMgYGRhdGFgLlxyXG4gICAgICogSWYgYSBtYXRjaCBpcyBmb3VuZCwgaXQgcmV0dXJucyBgaW5kZXhgIGltbWVkaWF0ZWx5LCBleGl0aW5nIHRoZVxyXG4gICAgICogbG9vcCBiZWNhdXNlIHRoZXJlJ3Mgbm8gcmVhc29uIHRvIGtlZXAgc2VhcmNoaW5nLiBUaGUgc2VhcmNoXHJcbiAgICAgKiBjb250aW51ZXMgdW50aWwgdGhlcmUgYXJlIG5vIG1vcmUgbm9kZXMgdG8gc2VhcmNoICh3aGVuIGBjdXJyZW50YCBpcyBgbnVsbGApLlxyXG4gICAgICovXHJcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICBpZiAoY3VycmVudC5kYXRhID09PSBkYXRhKSB7XHJcbiAgICAgICAgcmV0dXJuIGluZGV4XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHRyYXZlcnNlIHRvIHRoZSBuZXh0IG5vZGUgaW4gdGhlIGxpc3RcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG5cclxuICAgICAgLy8ga2VlcCB0cmFjayBvZiB3aGVyZSB3ZSBhcmVcclxuICAgICAgaW5kZXgrK1xyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBJZiBleGVjdXRpb24gZ2V0cyB0byB0aGlzIHBvaW50LCBpdCBtZWFucyB3ZSByZWFjaGVkIHRoZSBlbmQgb2YgdGhlXHJcbiAgICAgKiBsaXN0IGFuZCBkaWRuJ3QgZmluZCBgZGF0YWAuIEp1c3QgcmV0dXJuIC0xIGFzIHRoZSBcIm5vdCBmb3VuZFwiIHZhbHVlLlxyXG4gICAgICovXHJcbiAgICByZXR1cm4gLTFcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGZpcnN0IGl0ZW0gdGhhdCBtYXRjaGVzIGEgZ2l2ZW4gZnVuY3Rpb24uXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbWF0Y2hlciBBIGZ1bmN0aW9uIHJldHVybmluZyB0cnVlIHdoZW4gYW4gaXRlbSBtYXRjaGVzXHJcbiAgICogICAgICBhbmQgZmFsc2Ugd2hlbiBhbiBpdGVtIGRvZXNuJ3QgbWF0Y2guXHJcbiAgICogQHJldHVybnMgeyp9IFRoZSBmaXJzdCBpdGVtIHRoYXQgcmV0dXJucyB0cnVlIGZyb20gdGhlIG1hdGNoZXIsIHVuZGVmaW5lZFxyXG4gICAqICAgICAgaWYgbm8gaXRlbXMgbWF0Y2guXHJcbiAgICovXHJcbiAgZmluZCAobWF0Y2hlcjogKGFyZzA6IFQpID0+IGJvb2xlYW4sIGFzTm9kZSA9IGZhbHNlKSA6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgVCB7XHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBub2Rlcy5cclxuICAgICAqIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG8gdGhlIGhlYWQgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZVxyXG4gICAgICogb2YgdGhlIGxvb3AgYmVsb3cuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50ID0gdGhpcy5oZWFkXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoaXMgbG9vcCBjaGVja3MgZWFjaCBub2RlIGluIHRoZSBsaXN0IHRvIHNlZSBpZiBpdCBtYXRjaGVzLlxyXG4gICAgICogSWYgYSBtYXRjaCBpcyBmb3VuZCwgaXQgcmV0dXJucyB0aGUgZGF0YSBpbW1lZGlhdGVseSwgZXhpdGluZyB0aGVcclxuICAgICAqIGxvb3AgYmVjYXVzZSB0aGVyZSdzIG5vIHJlYXNvbiB0byBrZWVwIHNlYXJjaGluZy4gVGhlIHNlYXJjaFxyXG4gICAgICogY29udGludWVzIHVudGlsIHRoZXJlIGFyZSBubyBtb3JlIG5vZGVzIHRvIHNlYXJjaCAod2hlbiBgY3VycmVudGAgaXMgYG51bGxgKS5cclxuICAgICAqL1xyXG4gICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwpIHtcclxuICAgICAgaWYgKG1hdGNoZXIoY3VycmVudC5kYXRhKSkge1xyXG4gICAgICAgIGlmIChhc05vZGUpIHtcclxuICAgICAgICAgIHJldHVybiBjdXJyZW50XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjdXJyZW50LmRhdGFcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gdHJhdmVyc2UgdG8gdGhlIG5leHQgbm9kZSBpbiB0aGUgbGlzdFxyXG4gICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0XHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIElmIGV4ZWN1dGlvbiBnZXRzIHRvIHRoaXMgcG9pbnQsIGl0IG1lYW5zIHdlIHJlYWNoZWQgdGhlIGVuZCBvZiB0aGVcclxuICAgICAqIGxpc3QgYW5kIGRpZG4ndCBmaW5kIGBkYXRhYC4gSnVzdCByZXR1cm4gYHVuZGVmaW5lZGAgYXMgdGhlXHJcbiAgICAgKiBcIm5vdCBmb3VuZFwiIHZhbHVlLlxyXG4gICAgICovXHJcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignTm8gbWF0Y2hpbmcgZGF0YSBmb3VuZCcpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgZmlyc3QgaXRlbSB0aGF0IG1hdGNoZXMgYSBnaXZlbiBmdW5jdGlvbi5cclxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBtYXRjaGVyIEEgZnVuY3Rpb24gcmV0dXJuaW5nIHRydWUgd2hlbiBhbiBpdGVtIG1hdGNoZXNcclxuICAgKiAgICAgIGFuZCBmYWxzZSB3aGVuIGFuIGl0ZW0gZG9lc24ndCBtYXRjaC5cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgaW5kZXggb2YgdGhlIGZpcnN0IGl0ZW0gdGhhdCBtYXRjaGVzIGEgZ2l2ZW4gZnVuY3Rpb25cclxuICAgKiAgICAgIG9yIC0xIGlmIHRoZXJlIGFyZSBubyBtYXRjaGluZyBpdGVtcy5cclxuICAgKi9cclxuICBmaW5kSW5kZXggKG1hdGNoZXI6IChhcmcwOiBUKSA9PiBib29sZWFuKTogbnVtYmVyIHtcclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gaXRlcmF0ZSBvdmVyIHRoZSBsaXN0IG5vZGVzLlxyXG4gICAgICogSXQgc3RhcnRzIG91dCBwb2ludGluZyB0byB0aGUgaGVhZCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlXHJcbiAgICAgKiBvZiB0aGUgbG9vcCBiZWxvdy5cclxuICAgICAqL1xyXG4gICAgbGV0IGN1cnJlbnQgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBpbmRleGAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayBob3cgZGVlcCBpbnRvIHRoZSBsaXN0IHdlJ3ZlXHJcbiAgICAgKiBnb25lLiBUaGlzIGlzIGltcG9ydGFudCBiZWNhdXNlIHRoaXMgaXMgdGhlIHZhbHVlIHRoYXQgaXMgcmV0dXJuZWRcclxuICAgICAqIGZyb20gdGhpcyBtZXRob2QuXHJcbiAgICAgKi9cclxuICAgIGxldCBpbmRleCA9IDBcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhpcyBsb29wIGNoZWNrcyBlYWNoIG5vZGUgaW4gdGhlIGxpc3QgdG8gc2VlIGlmIGl0IG1hdGNoZXMuXHJcbiAgICAgKiBJZiBhIG1hdGNoIGlzIGZvdW5kLCBpdCByZXR1cm5zIHRoZSBpbmRleCBpbW1lZGlhdGVseSwgZXhpdGluZyB0aGVcclxuICAgICAqIGxvb3AgYmVjYXVzZSB0aGVyZSdzIG5vIHJlYXNvbiB0byBrZWVwIHNlYXJjaGluZy4gVGhlIHNlYXJjaFxyXG4gICAgICogY29udGludWVzIHVudGlsIHRoZXJlIGFyZSBubyBtb3JlIG5vZGVzIHRvIHNlYXJjaCAod2hlbiBgY3VycmVudGAgaXMgYG51bGxgKS5cclxuICAgICAqL1xyXG4gICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwpIHtcclxuICAgICAgaWYgKG1hdGNoZXIoY3VycmVudC5kYXRhKSkge1xyXG4gICAgICAgIHJldHVybiBpbmRleFxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB0cmF2ZXJzZSB0byB0aGUgbmV4dCBub2RlIGluIHRoZSBsaXN0XHJcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRcclxuXHJcbiAgICAgIC8vIGtlZXAgdHJhY2sgb2Ygd2hlcmUgd2UgYXJlXHJcbiAgICAgIGluZGV4KytcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogSWYgZXhlY3V0aW9uIGdldHMgdG8gdGhpcyBwb2ludCwgaXQgbWVhbnMgd2UgcmVhY2hlZCB0aGUgZW5kIG9mIHRoZVxyXG4gICAgICogbGlzdCBhbmQgZGlkbid0IGZpbmQgYGRhdGFgLiBKdXN0IHJldHVybiAtMSBhcyB0aGVcclxuICAgICAqIFwibm90IGZvdW5kXCIgdmFsdWUuXHJcbiAgICAgKi9cclxuICAgIHJldHVybiAtMVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyB0aGUgbm9kZSBmcm9tIHRoZSBnaXZlbiBsb2NhdGlvbiBpbiB0aGUgbGlzdC5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggVGhlIHplcm8tYmFzZWQgaW5kZXggb2YgdGhlIG5vZGUgdG8gcmVtb3ZlLlxyXG4gICAqIEByZXR1cm5zIHsqfSBUaGUgZGF0YSBpbiB0aGUgZ2l2ZW4gcG9zaXRpb24gaW4gdGhlIGxpc3QuXHJcbiAgICogQHRocm93cyB7UmFuZ2VFcnJvcn0gSWYgaW5kZXggaXMgb3V0IG9mIHJhbmdlLlxyXG4gICAqL1xyXG4gIHJlbW92ZSAoaW5kZXg6IG51bWJlcikgOiBUIHtcclxuICAgIC8vIHNwZWNpYWwgY2FzZXM6IG5vIG5vZGVzIGluIHRoZSBsaXN0IG9yIGBpbmRleGAgaXMgbmVnYXRpdmVcclxuICAgIGlmICh0aGlzLmhlYWQgPT09IG51bGwgfHwgaW5kZXggPCAwKSB7XHJcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBJbmRleCAke2luZGV4fSBkb2VzIG5vdCBleGlzdCBpbiB0aGUgbGlzdC5gKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHNwZWNpYWwgY2FzZTogcmVtb3ZpbmcgdGhlIGZpcnN0IG5vZGVcclxuICAgIGlmIChpbmRleCA9PT0gMCkge1xyXG4gICAgICAvLyBzdG9yZSB0aGUgZGF0YSBmcm9tIHRoZSBjdXJyZW50IGhlYWRcclxuICAgICAgY29uc3QgZGF0YTogVCA9IHRoaXMuaGVhZC5kYXRhXHJcblxyXG4gICAgICAvLyBqdXN0IHJlcGxhY2UgdGhlIGhlYWQgd2l0aCB0aGUgbmV4dCBub2RlIGluIHRoZSBsaXN0XHJcbiAgICAgIHRoaXMuaGVhZCA9IHRoaXMuaGVhZC5uZXh0XHJcblxyXG4gICAgICAvLyBzcGVjaWFsIGNhc2U6IHRoZXJlIHdhcyBvbmx5IG9uZSBub2RlLCBzbyBhbHNvIHJlc2V0IGB0aGlzLnRhaWxgXHJcbiAgICAgIGlmICh0aGlzLmhlYWQgPT09IG51bGwpIHtcclxuICAgICAgICB0aGlzLnRhaWwgPSBudWxsXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5oZWFkLnByZXZpb3VzID0gbnVsbFxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyByZXR1cm4gdGhlIGRhdGEgYXQgdGhlIHByZXZpb3VzIGhlYWQgb2YgdGhlIGxpc3RcclxuICAgICAgcmV0dXJuIGRhdGFcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBub2Rlcy5cclxuICAgICAqIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG8gdGhlIGhlYWQgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZVxyXG4gICAgICogb2YgdGhlIGxvb3AgYmVsb3cuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50OiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGwgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBpYCB2YXJpYWJsZSBpcyB1c2VkIHRvIHRyYWNrIGhvdyBkZWVwIGludG8gdGhlIGxpc3Qgd2UndmVcclxuICAgICAqIGdvbmUuIFRoaXMgaXMgaW1wb3J0YW50IGJlY2F1c2UgaXQncyB0aGUgb25seSB3YXkgdG8ga25vdyB3aGVuXHJcbiAgICAgKiB3ZSd2ZSBoaXQgdGhlIGBpbmRleGAgdG8gcmVtb3ZlLlxyXG4gICAgICovXHJcbiAgICBsZXQgaSA9IDBcclxuXHJcbiAgICAvKlxyXG4gICAgICogVHJhdmVyc2UgdGhlIGxpc3Qgbm9kZXMgc2ltaWxhciB0byB0aGUgYGdldCgpYCBtZXRob2QsIGJ1dCBtYWtlXHJcbiAgICAgKiBzdXJlIHRvIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgbm9kZXMgaGF2ZSBiZWVuIHZpc2l0ZWQuIFdoZW5cclxuICAgICAqIGBpYCBpcyB0aGUgc2FtZSBhcyBgaW5kZXhgLCBpdCBtZWFucyB3ZSd2ZSBmb3VuZCB0aGUgbG9jYXRpb24gdG9cclxuICAgICAqIHJlbW92ZS5cclxuICAgICAqL1xyXG4gICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwgJiYgaSA8IGluZGV4KSB7XHJcbiAgICAgIC8vIHRyYXZlcnNlIHRvIHRoZSBuZXh0IG5vZGVcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG5cclxuICAgICAgLy8gaW5jcmVtZW50IHRoZSBjb3VudFxyXG4gICAgICBpKytcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogSWYgYGN1cnJlbnRgIGlzbid0IGBudWxsYCwgdGhlbiB0aGF0IG1lYW5zIHdlJ3ZlIGZvdW5kIHRoZSBub2RlXHJcbiAgICAgKiB0byByZW1vdmUuXHJcbiAgICAgKi9cclxuICAgIGlmIChjdXJyZW50ICE9PSBudWxsKSB7XHJcbiAgICAgIC8vIHNraXAgb3ZlciB0aGUgbm9kZSB0byByZW1vdmVcclxuICAgICAgY3VycmVudCEucHJldmlvdXMhLm5leHQgPSBjdXJyZW50Lm5leHRcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIElmIHdlIGFyZSBhdCB0aGUgZW5kIG9mIHRoZSBsaXN0LCB0aGVuIHVwZGF0ZSBgdGhpcy50YWlsYC5cclxuICAgICAgICpcclxuICAgICAgICogSWYgd2UgYXJlIG5vdCBhdCB0aGUgZW5kIG9mIHRoZSBsaXN0LCB0aGVuIHVwZGF0ZSB0aGUgYmFja3dhcmRzXHJcbiAgICAgICAqIHBvaW50ZXIgZm9yIGBjdXJyZW50Lm5leHRgIHRvIHByZXNlcnZlIHJldmVyc2UgdHJhdmVyc2FsLlxyXG4gICAgICAgKi9cclxuICAgICAgaWYgKHRoaXMudGFpbCA9PT0gY3VycmVudCkge1xyXG4gICAgICAgIHRoaXMudGFpbCA9IGN1cnJlbnQucHJldmlvdXNcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjdXJyZW50IS5uZXh0IS5wcmV2aW91cyA9IGN1cnJlbnQucHJldmlvdXNcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gcmV0dXJuIHRoZSB2YWx1ZSB0aGF0IHdhcyBqdXN0IHJlbW92ZWQgZnJvbSB0aGUgbGlzdFxyXG4gICAgICByZXR1cm4gY3VycmVudC5kYXRhXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIElmIHdlJ3ZlIG1hZGUgaXQgdGhpcyBmYXIsIGl0IG1lYW5zIGBpbmRleGAgaXMgYSB2YWx1ZSB0aGF0XHJcbiAgICAgKiBkb2Vzbid0IGV4aXN0IGluIHRoZSBsaXN0LCBzbyB0aHJvdyBhbiBlcnJvci5cclxuICAgICAqL1xyXG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYEluZGV4ICR7aW5kZXh9IGRvZXMgbm90IGV4aXN0IGluIHRoZSBsaXN0LmApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIGFsbCBub2RlcyBmcm9tIHRoZSBsaXN0LlxyXG4gICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAqL1xyXG4gIGNsZWFyICgpOiB2b2lkIHtcclxuICAgIC8vIGp1c3QgcmVzZXQgYm90aCB0aGUgaGVhZCBhbmQgdGFpbCBwb2ludGVyIHRvIG51bGxcclxuICAgIHRoaXMuaGVhZCA9IG51bGxcclxuICAgIHRoaXMudGFpbCA9IG51bGxcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBub2RlcyBpbiB0aGUgbGlzdC5cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgbnVtYmVyIG9mIG5vZGVzIGluIHRoZSBsaXN0LlxyXG4gICAqL1xyXG4gIGdldCBzaXplICgpOiBudW1iZXIge1xyXG4gICAgLy8gc3BlY2lhbCBjYXNlOiB0aGUgbGlzdCBpcyBlbXB0eVxyXG4gICAgaWYgKHRoaXMuaGVhZCA9PT0gbnVsbCkge1xyXG4gICAgICByZXR1cm4gMFxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gaXRlcmF0ZSBvdmVyIHRoZSBsaXN0IG5vZGVzLlxyXG4gICAgICogSXQgc3RhcnRzIG91dCBwb2ludGluZyB0byB0aGUgaGVhZCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlXHJcbiAgICAgKiBvZiB0aGUgbG9vcCBiZWxvdy5cclxuICAgICAqL1xyXG4gICAgbGV0IGN1cnJlbnQ6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgbnVsbCA9IHRoaXMuaGVhZFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGNvdW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgbm9kZXMgaGF2ZVxyXG4gICAgICogYmVlbiB2aXNpdGVkIGluc2lkZSB0aGUgbG9vcCBiZWxvdy4gVGhpcyBpcyBpbXBvcnRhbnQgYmVjYXVzZSB0aGlzXHJcbiAgICAgKiBpcyB0aGUgdmFsdWUgdG8gcmV0dXJuIGZyb20gdGhpcyBtZXRob2QuXHJcbiAgICAgKi9cclxuICAgIGxldCBjb3VudCA9IDBcclxuXHJcbiAgICAvKlxyXG4gICAgICogQXMgbG9uZyBhcyBgY3VycmVudGAgaXMgbm90IGBudWxsYCwgdGhhdCBtZWFucyB3ZSdyZSBub3QgeWV0IGF0IHRoZVxyXG4gICAgICogZW5kIG9mIHRoZSBsaXN0LCBzbyBhZGRpbmcgMSB0byBgY291bnRgIGFuZCB0cmF2ZXJzZSB0byB0aGUgbmV4dCBub2RlLlxyXG4gICAgICovXHJcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICBjb3VudCsrXHJcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogV2hlbiBgY3VycmVudGAgaXMgYG51bGxgLCB0aGUgbG9vcCBpcyBleGl0ZWQgYXQgdGhlIHZhbHVlIG9mIGBjb3VudGBcclxuICAgICAqIGlzIHRoZSBudW1iZXIgb2Ygbm9kZXMgdGhhdCB3ZXJlIGNvdW50ZWQgaW4gdGhlIGxvb3AuXHJcbiAgICAgKi9cclxuICAgIHJldHVybiBjb3VudFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIGRlZmF1bHQgaXRlcmF0b3IgZm9yIHRoZSBjbGFzcy5cclxuICAgKiBAcmV0dXJucyB7SXRlcmF0b3J9IEFuIGl0ZXJhdG9yIGZvciB0aGUgY2xhc3MuXHJcbiAgICovXHJcbiAgW1N5bWJvbC5pdGVyYXRvcl0gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudmFsdWVzKClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhbiBpdGVyYXRvciB0aGF0IHJldHVybnMgZWFjaCBub2RlIGluIHRoZSBsaXN0LlxyXG4gICAqIEByZXR1cm5zIHtHZW5lcmF0b3J9IEFuIGl0ZXJhdG9yIG9uIHRoZSBsaXN0LlxyXG4gICAqL1xyXG4gICogdmFsdWVzICgpOiBHZW5lcmF0b3I8VCwgdm9pZCwgdW5rbm93bj4ge1xyXG4gICAgLypcclxuICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byBpdGVyYXRlIG92ZXIgdGhlIGxpc3Qgbm9kZXMuXHJcbiAgICAgKiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvIHRoZSBoZWFkIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGVcclxuICAgICAqIG9mIHRoZSBsb29wIGJlbG93LlxyXG4gICAgICovXHJcbiAgICBsZXQgY3VycmVudCA9IHRoaXMuaGVhZFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBBcyBsb25nIGFzIGBjdXJyZW50YCBpcyBub3QgYG51bGxgLCB0aGVyZSBpcyBhIHBpZWNlIG9mIGRhdGFcclxuICAgICAqIHRvIHlpZWxkLlxyXG4gICAgICovXHJcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICB5aWVsZCBjdXJyZW50LmRhdGFcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIGFuIGl0ZXJhdG9yIHRoYXQgcmV0dXJucyBlYWNoIG5vZGUgaW4gdGhlIGxpc3QgaW4gcmV2ZXJzZSBvcmRlci5cclxuICAgKiBAcmV0dXJucyB7R2VuZXJhdG9yfSBBbiBpdGVyYXRvciBvbiB0aGUgbGlzdC5cclxuICAgKi9cclxuICAqIHJldmVyc2UgKCk6IEdlbmVyYXRvcjxULCB2b2lkLCB1bmtub3duPiB7XHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBub2Rlcy5cclxuICAgICAqIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG8gdGhlIHRhaWwgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZVxyXG4gICAgICogb2YgdGhlIGxvb3AgYmVsb3cuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50ID0gdGhpcy50YWlsXHJcblxyXG4gICAgLypcclxuICAgICAqIEFzIGxvbmcgYXMgYGN1cnJlbnRgIGlzIG5vdCBgbnVsbGAsIHRoZXJlIGlzIGEgcGllY2Ugb2YgZGF0YVxyXG4gICAgICogdG8geWllbGQuXHJcbiAgICAgKi9cclxuICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsKSB7XHJcbiAgICAgIHlpZWxkIGN1cnJlbnQuZGF0YVxyXG4gICAgICBjdXJyZW50ID0gY3VycmVudC5wcmV2aW91c1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydHMgdGhlIGxpc3QgaW50byBhIHN0cmluZyByZXByZXNlbnRhdGlvbi5cclxuICAgKiBAcmV0dXJucyB7U3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbGlzdC5cclxuICAgKi9cclxuICB0b1N0cmluZyAoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBbLi4udGhpc10udG9TdHJpbmcoKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRG91Ymx5TGlua2VkTGlzdFxyXG5leHBvcnQgZnVuY3Rpb25cclxuYXJyYXlUb0RvdWJseUxpbmtlZExpc3QgPFQ+IChhcnI6IEFycmF5PFQ+KSB7XHJcbiAgY29uc3QgbGlzdCA9IG5ldyBEb3VibHlMaW5rZWRMaXN0PFQ+KClcclxuICBhcnIuZm9yRWFjaCgoZGF0YSkgPT4ge1xyXG4gICAgbGlzdC5hZGQoZGF0YSlcclxuICB9KVxyXG5cclxuICByZXR1cm4gbGlzdFxyXG59XHJcbiIsImltcG9ydCB7XHJcbiAgY29uZmlnLFxyXG4gIHByb21pc2VIYW5kbGVyLFxyXG4gIG1pbGxpc1RvTWludXRlc0FuZFNlY29uZHMsXHJcbiAgaHRtbFRvRWxcclxufSBmcm9tICcuLi9jb25maWcnXHJcbmltcG9ydCB7IERvdWJseUxpbmtlZExpc3ROb2RlIH0gZnJvbSAnLi9kb3VibHktbGlua2VkLWxpc3QnXHJcbmltcG9ydCBQbGF5YWJsZUV2ZW50QXJnIGZyb20gJy4vcHVic3ViL2V2ZW50LWFyZ3MvdHJhY2stcGxheS1hcmdzJ1xyXG5pbXBvcnQgYXhpb3MsIHsgQXhpb3NSZXNwb25zZSB9IGZyb20gJ2F4aW9zJ1xyXG5pbXBvcnQgRXZlbnRBZ2dyZWdhdG9yIGZyb20gJy4vcHVic3ViL2FnZ3JlZ2F0b3InXHJcbmltcG9ydCB7IElQbGF5YWJsZSB9IGZyb20gJy4uLy4uL3R5cGVzJ1xyXG5pbXBvcnQgU3BvdGlmeVBsYXliYWNrRWxlbWVudCBmcm9tICcuL3Nwb3RpZnktcGxheWJhY2stZWxlbWVudCdcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGxvYWRWb2x1bWUgKCkge1xyXG4gIGNvbnN0IHsgcmVzLCBlcnIgfSA9IGF3YWl0IHByb21pc2VIYW5kbGVyKGF4aW9zLmdldChjb25maWcuVVJMcy5nZXRQbGF5ZXJWb2x1bWVEYXRhKSlcclxuXHJcbiAgaWYgKGVycikge1xyXG4gICAgcmV0dXJuIDBcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIHJlcyEuZGF0YVxyXG4gIH1cclxufVxyXG5hc3luYyBmdW5jdGlvbiBzYXZlVm9sdW1lICh2b2x1bWU6IHN0cmluZykge1xyXG4gIHByb21pc2VIYW5kbGVyKGF4aW9zLnB1dChjb25maWcuVVJMcy5wdXRQbGF5ZXJWb2x1bWVEYXRhKHZvbHVtZSkpKVxyXG59XHJcblxyXG5jbGFzcyBTcG90aWZ5UGxheWJhY2sge1xyXG4gIHByaXZhdGUgcGxheWVyOiBhbnk7XHJcbiAgLy8gY29udHJvbHMgdGltaW5nIG9mIGFzeW5jIGFjdGlvbnMgd2hlbiB3b3JraW5nIHdpdGggd2VicGxheWVyIHNka1xyXG4gIHByaXZhdGUgaXNFeGVjdXRpbmdBY3Rpb246IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSBkZXZpY2VfaWQ6IHN0cmluZztcclxuICBzZWxQbGF5aW5nOiB7XHJcbiAgICAgIGVsZW1lbnQ6IG51bGwgfCBFbGVtZW50XHJcbiAgICAgIHRyYWNrX3VyaTogc3RyaW5nXHJcbiAgICAgIHRyYWNrRGF0YU5vZGU6IG51bGwgfCBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFN0YXRlSW50ZXJ2YWw6IE5vZGVKUy5UaW1lb3V0IHwgbnVsbDtcclxuICBwcml2YXRlIHdlYlBsYXllckVsOiBTcG90aWZ5UGxheWJhY2tFbGVtZW50O1xyXG4gIHByaXZhdGUgcGxheWVySXNSZWFkeTogYm9vbGVhbjtcclxuXHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IGZhbHNlXHJcbiAgICB0aGlzLnBsYXllciA9IG51bGxcclxuICAgIHRoaXMuZGV2aWNlX2lkID0gJydcclxuICAgIHRoaXMuZ2V0U3RhdGVJbnRlcnZhbCA9IG51bGxcclxuXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcgPSB7XHJcbiAgICAgIGVsZW1lbnQ6IG51bGwsXHJcbiAgICAgIHRyYWNrX3VyaTogJycsXHJcbiAgICAgIHRyYWNrRGF0YU5vZGU6IG51bGxcclxuICAgIH1cclxuICAgIHRoaXMucGxheWVySXNSZWFkeSA9IGZhbHNlXHJcbiAgICB0aGlzLl9sb2FkV2ViUGxheWVyKClcclxuXHJcbiAgICAvLyBwYXNzIGl0IHRoZSBcInRoaXMuXCIgYXR0cmlidXRlcyBpbiB0aGlzIHNjb3BlIGJlY2F1c2Ugd2hlbiBhIGZ1bmN0aW9uIGlzIGNhbGxlZCBmcm9tIGEgZGlmZmVyZW50IGNsYXNzIHRoZSBcInRoaXMuXCIgYXR0cmlidXRlcyBhcmUgdW5kZWZpbmVkLlxyXG4gICAgdGhpcy53ZWJQbGF5ZXJFbCA9IG5ldyBTcG90aWZ5UGxheWJhY2tFbGVtZW50KClcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2V0Vm9sdW1lIChwZXJjZW50YWdlOiBudW1iZXIsIHBsYXllcjogYW55LCBzYXZlOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgIGNvbnN0IG5ld1ZvbHVtZSA9IHBlcmNlbnRhZ2UgLyAxMDBcclxuICAgIHBsYXllci5zZXRWb2x1bWUobmV3Vm9sdW1lKVxyXG5cclxuICAgIGlmIChzYXZlKSB7XHJcbiAgICAgIHNhdmVWb2x1bWUobmV3Vm9sdW1lLnRvU3RyaW5nKCkpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgdGhlIHRpbWUgc2hvd24gd2hlbiBzZWVraW5nLlxyXG4gICAqIEBwYXJhbSBwZXJjZW50YWdlIFRoZSBwZXJjZW50IHRoYXQgdGhlIGJhciBoYXMgZmlsbGVkIHdpdGggcmVzcGVjdCB0byB0aGUgZW50aXJlIGJhclxyXG4gICAqIEBwYXJhbSB3ZWJQbGF5ZXJFbCBUaGUgd2VicGxheWVyIGVsZW1lbnQgdGhhdCBnaXZlcyB1cyBhY2Nlc3MgdG8gdGhlIHNvbmcgcHJvZ3Jlc3MgYmFyXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBvblNlZWtpbmcgKHBlcmNlbnRhZ2U6IG51bWJlciwgd2ViUGxheWVyRWw6IFNwb3RpZnlQbGF5YmFja0VsZW1lbnQpIHtcclxuICAgIC8vIGdldCB0aGUgcG9zaXRpb24gYnkgdXNpbmcgdGhlIHBlcmNlbnQgdGhlIHByb2dyZXNzIGJhci5cclxuICAgIGNvbnN0IHNlZWtQb3NpdGlvbiA9IHdlYlBsYXllckVsLnNvbmdQcm9ncmVzcyEubWF4ICogKHBlcmNlbnRhZ2UgLyAxMDApXHJcbiAgICBpZiAod2ViUGxheWVyRWwuY3VyclRpbWUgPT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0N1cnJlbnQgdGltZSBlbGVtZW50IGlzIG51bGwnKVxyXG4gICAgfVxyXG4gICAgLy8gdXBkYXRlIHRoZSB0ZXh0IGNvbnRlbnQgdG8gc2hvdyB0aGUgdGltZSB0aGUgdXNlciB3aWxsIGJlIHNlZWtpbmcgdG9vIG9ubW91c2V1cC5cclxuICAgIHdlYlBsYXllckVsLmN1cnJUaW1lLnRleHRDb250ZW50ID0gbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyhzZWVrUG9zaXRpb24pXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGdW5jdGlvbiB0byBydW4gd2hlbiB0aGUgc2Vla2luZyBhY3Rpb24gYmVnaW5zXHJcbiAgICogQHBhcmFtIHBsYXllciBUaGUgc3BvdGlmeSBzZGsgcGxheWVyIHdob3NlIHN0YXRlIHdlIHdpbGwgdXNlIHRvIGNoYW5nZSB0aGUgc29uZydzIHByb2dyZXNzIGJhcidzIG1heCB2YWx1ZSB0byB0aGUgZHVyYXRpb24gb2YgdGhlIHNvbmcuXHJcbiAgICogQHBhcmFtIHdlYlBsYXllckVsIFRoZSB3ZWIgcGxheWVyIGVsZW1lbnQgdGhhdCB3aWxsIGFsbG93IHVzIHRvIG1vZGlmeSB0aGUgcHJvZ3Jlc3MgYmFycyBtYXggYXR0cmlidXRlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgb25TZWVrU3RhcnQgKHBsYXllcjogYW55LCB3ZWJQbGF5ZXJFbDogU3BvdGlmeVBsYXliYWNrRWxlbWVudCkge1xyXG4gICAgcGxheWVyLmdldEN1cnJlbnRTdGF0ZSgpLnRoZW4oKHN0YXRlOiB7IGR1cmF0aW9uOiBhbnkgfSkgPT4ge1xyXG4gICAgICBpZiAoIXN0YXRlKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcclxuICAgICAgICAgICdVc2VyIGlzIG5vdCBwbGF5aW5nIG11c2ljIHRocm91Z2ggdGhlIFdlYiBQbGF5YmFjayBTREsnXHJcbiAgICAgICAgKVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9XHJcbiAgICAgIC8vIHdoZW4gZmlyc3Qgc2Vla2luZywgdXBkYXRlIHRoZSBtYXggYXR0cmlidXRlIHdpdGggdGhlIGR1cmF0aW9uIG9mIHRoZSBzb25nIGZvciB1c2Ugd2hlbiBzZWVraW5nLlxyXG4gICAgICB3ZWJQbGF5ZXJFbC5zb25nUHJvZ3Jlc3MhLm1heCA9IHN0YXRlLmR1cmF0aW9uXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRnVuY3Rpb24gdG8gcnVuIHdoZW4geW91IHdpc2ggdG8gc2VlayB0byBhIGNlcnRhaW4gcG9zaXRpb24gaW4gYSBzb25nLlxyXG4gICAqIEBwYXJhbSBwZXJjZW50YWdlIFRoZSBwZXJjZW50IHRoYXQgdGhlIGJhciBoYXMgZmlsbGVkIHdpdGggcmVzcGVjdCB0byB0aGUgZW50aXJlIGJhclxyXG4gICAqIEBwYXJhbSBwbGF5ZXIgdGhlIHNwb3RpZnkgc2RrIHBsYXllciB0aGF0IHdpbGwgc2VlayB0aGUgc29uZyB0byBhIGdpdmVuIHBvc2l0aW9uXHJcbiAgICogQHBhcmFtIHdlYlBsYXllckVsIHRoZSB3ZWIgcGxheWVyIGVsZW1lbnQgdGhhdCBnaXZlcyB1cyBhY2Nlc3MgdG8gdGhlIHNvbmcgcHJvZ3Jlc3MgYmFyLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgc2Vla1NvbmcgKHBlcmNlbnRhZ2U6IG51bWJlciwgcGxheWVyOiBhbnksIHdlYlBsYXllckVsOiBTcG90aWZ5UGxheWJhY2tFbGVtZW50KSB7XHJcbiAgICBpZiAoIXRoaXMuaXNFeGVjdXRpbmdBY3Rpb24pIHtcclxuICAgICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IHRydWVcclxuICAgICAgLy8gb2J0YWluIHRoZSBmaW5hbCBwb3NpdGlvbiB0aGUgdXNlciB3aXNoZXMgdG8gc2VlayBvbmNlIG1vdXNlIGlzIHVwLlxyXG4gICAgICBjb25zdCBwb3NpdGlvbiA9IChwZXJjZW50YWdlIC8gMTAwKSAqIHdlYlBsYXllckVsLnNvbmdQcm9ncmVzcyEubWF4XHJcblxyXG4gICAgICAvLyBzZWVrIHRvIHRoZSBjaG9zZW4gcG9zaXRpb24uXHJcbiAgICAgIHBsYXllci5zZWVrKHBvc2l0aW9uKS50aGVuKCgpID0+IHtcclxuICAgICAgICB0aGlzLmlzRXhlY3V0aW5nQWN0aW9uID0gZmFsc2VcclxuICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgX2xvYWRXZWJQbGF5ZXIgKCkge1xyXG4gICAgLy8gbG9hZCB0aGUgdXNlcnMgc2F2ZWQgdm9sdW1lIGlmIHRoZXJlIGlzbnQgdGhlbiBsb2FkIDAuNCBhcyBkZWZhdWx0LlxyXG4gICAgY29uc3Qgdm9sdW1lID0gYXdhaXQgbG9hZFZvbHVtZSgpXHJcblxyXG4gICAgcHJvbWlzZUhhbmRsZXI8QXhpb3NSZXNwb25zZTxzdHJpbmcgfCBudWxsPj4oYXhpb3MucmVxdWVzdDxzdHJpbmcgfCBudWxsPih7IG1ldGhvZDogJ0dFVCcsIHVybDogY29uZmlnLlVSTHMuZ2V0QWNjZXNzVG9rZW4gfSksIChyZXMpID0+IHtcclxuICAgICAgLy8gdGhpcyB0YWtlcyB0b28gbG9uZyBhbmQgc3BvdGlmeSBzZGsgbmVlZHMgd2luZG93Lm9uU3BvdGlmeVdlYlBsYXliYWNrU0RLUmVhZHkgdG8gYmUgZGVmaW5lZCBxdWlja2VyLlxyXG4gICAgICBjb25zdCBOT19DT05URU5UID0gMjA0XHJcbiAgICAgIGlmIChyZXMuc3RhdHVzID09PSBOT19DT05URU5UIHx8IHJlcy5kYXRhID09PSBudWxsKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdhY2Nlc3MgdG9rZW4gaGFzIG5vIGNvbnRlbnQnKVxyXG4gICAgICB9IGVsc2UgaWYgKHdpbmRvdy5TcG90aWZ5KSB7XHJcbiAgICAgICAgLy8gaWYgdGhlIHNwb3RpZnkgc2RrIGlzIGFscmVhZHkgZGVmaW5lZCBzZXQgcGxheWVyIHdpdGhvdXQgc2V0dGluZyBvblNwb3RpZnlXZWJQbGF5YmFja1NES1JlYWR5IG1lYW5pbmcgdGhlIHdpbmRvdzogV2luZG93IGlzIGluIGEgZGlmZmVyZW50IHNjb3BlXHJcbiAgICAgICAgLy8gdXNlIHdpbmRvdy5TcG90aWZ5LlBsYXllciBhcyBzcG90aWZ5IG5hbWVzcGFjZSBpcyBkZWNsYXJlZCBpbiB0aGUgV2luZG93IGludGVyZmFjZSBhcyBwZXIgRGVmaW5pdGVseVR5cGVkIC0+IHNwb3RpZnktd2ViLXBsYXliYWNrLXNkayAtPiBpbmRleC5kLnRzIGh0dHBzOi8vZ2l0aHViLmNvbS9EZWZpbml0ZWx5VHlwZWQvRGVmaW5pdGVseVR5cGVkL3RyZWUvbWFzdGVyL3R5cGVzL3Nwb3RpZnktd2ViLXBsYXliYWNrLXNka1xyXG4gICAgICAgIHRoaXMucGxheWVyID0gbmV3IHdpbmRvdy5TcG90aWZ5LlBsYXllcih7XHJcbiAgICAgICAgICBuYW1lOiAnU3BvdGlmeSBJbmZvIFdlYiBQbGF5ZXInLFxyXG4gICAgICAgICAgZ2V0T0F1dGhUb2tlbjogKGNiKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIGdpdmUgdGhlIHRva2VuIHRvIGNhbGxiYWNrXHJcbiAgICAgICAgICAgIGNiKHJlcy5kYXRhKVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHZvbHVtZTogdm9sdW1lXHJcbiAgICAgICAgfSlcclxuICAgICAgICB0aGlzLl9hZGRMaXN0ZW5lcnModm9sdW1lKVxyXG4gICAgICAgIC8vIENvbm5lY3QgdG8gdGhlIHBsYXllciFcclxuICAgICAgICB0aGlzLnBsYXllci5jb25uZWN0KClcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBvZiBzcG90aWZ5IHNkayBpcyB1bmRlZmluZWRcclxuICAgICAgICB3aW5kb3cub25TcG90aWZ5V2ViUGxheWJhY2tTREtSZWFkeSA9ICgpID0+IHtcclxuICAgICAgICAgIC8vIGlmIGdldHRpbmcgdG9rZW4gd2FzIHN1Y2Nlc2Z1bCBjcmVhdGUgc3BvdGlmeSBwbGF5ZXIgdXNpbmcgdGhlIHdpbmRvdyBpbiB0aGlzIHNjb3BlXHJcbiAgICAgICAgICB0aGlzLnBsYXllciA9IG5ldyB3aW5kb3cuU3BvdGlmeS5QbGF5ZXIoe1xyXG4gICAgICAgICAgICBuYW1lOiAnU3BvdGlmeSBJbmZvIFdlYiBQbGF5ZXInLFxyXG4gICAgICAgICAgICBnZXRPQXV0aFRva2VuOiAoY2IpID0+IHtcclxuICAgICAgICAgICAgICAvLyBnaXZlIHRoZSB0b2tlbiB0byBjYWxsYmFja1xyXG4gICAgICAgICAgICAgIGNiKHJlcy5kYXRhKVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB2b2x1bWU6IHZvbHVtZVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIHRoaXMuX2FkZExpc3RlbmVycyh2b2x1bWUpXHJcbiAgICAgICAgICAvLyBDb25uZWN0IHRvIHRoZSBwbGF5ZXIhXHJcbiAgICAgICAgICB0aGlzLnBsYXllci5jb25uZWN0KClcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9hZGRMaXN0ZW5lcnMgKGxvYWRlZFZvbHVtZTogc3RyaW5nKSB7XHJcbiAgICAvLyBFcnJvciBoYW5kbGluZ1xyXG4gICAgdGhpcy5wbGF5ZXIuYWRkTGlzdGVuZXIoJ2luaXRpYWxpemF0aW9uX2Vycm9yJywgKHsgbWVzc2FnZSB9OiB7IG1lc3NhZ2U6IHVua25vd24gfSkgPT4ge1xyXG4gICAgICBjb25zb2xlLmVycm9yKG1lc3NhZ2UpXHJcbiAgICB9KVxyXG4gICAgdGhpcy5wbGF5ZXIuYWRkTGlzdGVuZXIoJ2F1dGhlbnRpY2F0aW9uX2Vycm9yJywgKHsgbWVzc2FnZSB9OiB7IG1lc3NhZ2U6IHVua25vd24gfSkgPT4ge1xyXG4gICAgICBjb25zb2xlLmVycm9yKG1lc3NhZ2UpXHJcbiAgICAgIGNvbnNvbGUubG9nKCdwbGF5YmFjayBjb3VsZG50IHN0YXJ0JylcclxuICAgIH0pXHJcbiAgICB0aGlzLnBsYXllci5hZGRMaXN0ZW5lcignYWNjb3VudF9lcnJvcicsICh7IG1lc3NhZ2UgfTogeyBtZXNzYWdlOiB1bmtub3duIH0pID0+IHtcclxuICAgICAgY29uc29sZS5lcnJvcihtZXNzYWdlKVxyXG4gICAgfSlcclxuICAgIHRoaXMucGxheWVyLmFkZExpc3RlbmVyKCdwbGF5YmFja19lcnJvcicsICh7IG1lc3NhZ2UgfTogeyBtZXNzYWdlOiB1bmtub3duIH0pID0+IHtcclxuICAgICAgY29uc29sZS5lcnJvcihtZXNzYWdlKVxyXG4gICAgfSlcclxuXHJcbiAgICAvLyBQbGF5YmFjayBzdGF0dXMgdXBkYXRlc1xyXG4gICAgdGhpcy5wbGF5ZXIuYWRkTGlzdGVuZXIoJ3BsYXllcl9zdGF0ZV9jaGFuZ2VkJywgKHN0YXRlOiBTcG90aWZ5LlBsYXliYWNrU3RhdGUgfCBudWxsKSA9PiB7fSlcclxuXHJcbiAgICAvLyBSZWFkeVxyXG4gICAgdGhpcy5wbGF5ZXIuYWRkTGlzdGVuZXIoJ3JlYWR5JywgKHsgZGV2aWNlX2lkIH06IHsgZGV2aWNlX2lkOiBzdHJpbmcgfSkgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygnUmVhZHkgd2l0aCBEZXZpY2UgSUQnLCBkZXZpY2VfaWQpXHJcbiAgICAgIHRoaXMuZGV2aWNlX2lkID0gZGV2aWNlX2lkXHJcblxyXG4gICAgICAvLyBhcHBlbmQgd2ViIHBsYXllciBlbGVtZW50IHRvIERPTVxyXG4gICAgICB0aGlzLndlYlBsYXllckVsLmFwcGVuZFdlYlBsYXllckh0bWwoXHJcbiAgICAgICAgKCkgPT4gdGhpcy50cnlQbGF5UHJldih0aGlzLnNlbFBsYXlpbmcudHJhY2tEYXRhTm9kZSksXHJcbiAgICAgICAgKCkgPT4gdGhpcy50cnlXZWJQbGF5ZXJQYXVzZSh0aGlzLnNlbFBsYXlpbmcudHJhY2tEYXRhTm9kZSksXHJcbiAgICAgICAgKCkgPT4gdGhpcy50cnlQbGF5TmV4dCh0aGlzLnNlbFBsYXlpbmcudHJhY2tEYXRhTm9kZSksXHJcbiAgICAgICAgKCkgPT4gdGhpcy5vblNlZWtTdGFydCh0aGlzLnBsYXllciwgdGhpcy53ZWJQbGF5ZXJFbCksXHJcbiAgICAgICAgKHBlcmNlbnRhZ2UpID0+IHRoaXMuc2Vla1NvbmcocGVyY2VudGFnZSwgdGhpcy5wbGF5ZXIsIHRoaXMud2ViUGxheWVyRWwpLFxyXG4gICAgICAgIChwZXJjZW50YWdlKSA9PiB0aGlzLm9uU2Vla2luZyhwZXJjZW50YWdlLCB0aGlzLndlYlBsYXllckVsKSxcclxuICAgICAgICAocGVyY2VudGFnZSwgc2F2ZSkgPT4gdGhpcy5zZXRWb2x1bWUocGVyY2VudGFnZSwgdGhpcy5wbGF5ZXIsIHNhdmUpLFxyXG4gICAgICAgIHBhcnNlRmxvYXQobG9hZGVkVm9sdW1lKVxyXG4gICAgICApXHJcbiAgICAgIHRoaXMucGxheWVySXNSZWFkeSA9IHRydWVcclxuICAgIH0pXHJcblxyXG4gICAgLy8gTm90IFJlYWR5XHJcbiAgICB0aGlzLnBsYXllci5hZGRMaXN0ZW5lcignbm90X3JlYWR5JywgKHsgZGV2aWNlX2lkIH06IHsgZGV2aWNlX2lkOiBzdHJpbmcgfSkgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygnRGV2aWNlIElEIGhhcyBnb25lIG9mZmxpbmUnLCBkZXZpY2VfaWQpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZXNldER1cmF0aW9uICgpIHtcclxuICAgIGlmICghdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbikge1xyXG4gICAgICB0aGlzLmlzRXhlY3V0aW5nQWN0aW9uID0gdHJ1ZVxyXG4gICAgICB0aGlzLnBsYXllci5zZWVrKDApLnRoZW4oKCkgPT4geyB0aGlzLmlzRXhlY3V0aW5nQWN0aW9uID0gZmFsc2UgfSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyaWVzIHRvIHBhdXNlIHRoZSBjdXJyZW50IHBsYXlpbmcgSVBsYXlhYmxlIG5vZGUgZnJvbSB0aGUgd2ViIHBsYXllci5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBjdXJyTm9kZSAtIHRoZSBjdXJyZW50IElQbGF5YWJsZSBub2RlIHRoYXQgd2FzL2lzIHBsYXlpbmdcclxuICAgKi9cclxuICBwcml2YXRlIHRyeVdlYlBsYXllclBhdXNlIChjdXJyTm9kZTogRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPiB8IG51bGwpIHtcclxuICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGlzIGlzIHRoZSBmaXJzdCBub2RlIG9yIGlmIGFuIGFjdGlvbiBpcyBwcm9jZXNzaW5nXHJcbiAgICBpZiAoIXRoaXMuaXNFeGVjdXRpbmdBY3Rpb24gJiYgY3Vyck5vZGUgIT09IG51bGwpIHtcclxuICAgICAgY29uc3QgcHJldlRyYWNrID0gY3Vyck5vZGUuZGF0YVxyXG4gICAgICBjb25zb2xlLmxvZygnVHJ5IHBsYXllciBwYXVzZScpXHJcbiAgICAgIHRoaXMuc2V0U2VsUGxheWluZ0VsKG5ldyBQbGF5YWJsZUV2ZW50QXJnKHByZXZUcmFjaywgY3Vyck5vZGUpKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJpZXMgdG8gcGxheSB0aGUgcHJldmlvdXMgSVBsYXlhYmxlIGdpdmVuIHRoZSBjdXJyZW50IHBsYXlpbmcgSVBsYXlhYmxlIG5vZGUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gY3Vyck5vZGUgLSB0aGUgY3VycmVudCBJUGxheWFibGUgbm9kZSB0aGF0IHdhcy9pcyBwbGF5aW5nXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB0cnlQbGF5UHJldiAoY3Vyck5vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4gfCBudWxsKSB7XHJcbiAgICBpZiAoY3Vyck5vZGUgPT09IG51bGwpIHtcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICAvLyBpZiBhbiBhY3Rpb24gaXMgcHJvY2Vzc2luZyB3ZSBjYW5ub3QgZG8gYW55dGhpbmdcclxuICAgIGlmICghdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbikge1xyXG4gICAgICB0aGlzLnBsYXllci5nZXRDdXJyZW50U3RhdGUoKS50aGVuKChzdGF0ZTogeyBwb3NpdGlvbjogYW55IH0pID0+IHtcclxuICAgICAgICBpZiAoc3RhdGUucG9zaXRpb24gPiAxMDAwKSB7XHJcbiAgICAgICAgICB0aGlzLnJlc2V0RHVyYXRpb24oKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBpZiAoY3Vyck5vZGUucHJldmlvdXMgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb25zdCBwcmV2VHJhY2sgPSBjdXJyTm9kZS5wcmV2aW91cy5kYXRhXHJcbiAgICAgICAgICB0aGlzLnNldFNlbFBsYXlpbmdFbChuZXcgUGxheWFibGVFdmVudEFyZyhwcmV2VHJhY2ssIGN1cnJOb2RlLnByZXZpb3VzKSlcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmllcyB0byBwbGF5IHRoZSBuZXh0IElQbGF5YWJsZSBnaXZlbiB0aGUgY3VycmVudCBwbGF5aW5nIElQbGF5YWJsZSBub2RlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGN1cnJOb2RlIC0gdGhlIGN1cnJlbnQgSVBsYXlhYmxlIG5vZGUgdGhhdCB3YXMvaXMgcGxheWluZ1xyXG4gICAqL1xyXG4gIHByaXZhdGUgdHJ5UGxheU5leHQgKGN1cnJOb2RlOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+IHwgbnVsbCkge1xyXG4gICAgaWYgKGN1cnJOb2RlID09PSBudWxsKSB7XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoaXMgaXMgdGhlIGxhc3Qgbm9kZSBvciBpZiBhbiBhY3Rpb24gaXMgcHJvY2Vzc2luZ1xyXG4gICAgaWYgKCF0aGlzLmlzRXhlY3V0aW5nQWN0aW9uICYmIGN1cnJOb2RlLm5leHQgIT09IG51bGwpIHtcclxuICAgICAgY29uc3QgbmV4dFRyYWNrID0gY3Vyck5vZGUubmV4dC5kYXRhXHJcbiAgICAgIHRoaXMuc2V0U2VsUGxheWluZ0VsKG5ldyBQbGF5YWJsZUV2ZW50QXJnKG5leHRUcmFjaywgY3Vyck5vZGUubmV4dCkpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNvbXBsZXRlbHlEZXNlbGVjdFRyYWNrICgpIHtcclxuICAgIGlmICh0aGlzLnNlbFBsYXlpbmcuZWxlbWVudCA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlbGVjdGVkIHBsYXlpbmcgZWxlbWVudCB3YXMgbnVsbCBiZWZvcmUgZGVzZWxlY3Rpb24gb24gc29uZyBmaW5pc2gnKVxyXG4gICAgfVxyXG4gICAgdGhpcy5wYXVzZURlc2VsZWN0VHJhY2soKVxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLnRyYWNrX3VyaSA9ICcnXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHBhdXNlRGVzZWxlY3RUcmFjayAoKSB7XHJcbiAgICBpZiAodGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQgPT09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZWxlY3RlZCBwbGF5aW5nIGVsZW1lbnQgd2FzIG51bGwgYmVmb3JlIGRlc2VsZWN0aW9uIG9uIHNvbmcgZmluaXNoJylcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcudHJhY2tEYXRhTm9kZT8uZGF0YS5vblN0b3BwZWQoKVxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICB0aGlzLndlYlBsYXllckVsLnBsYXlQYXVzZT8uY2xhc3NMaXN0LnJlbW92ZShjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcuZWxlbWVudCA9IG51bGxcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2VsZWN0VHJhY2sgKGV2ZW50QXJnOiBQbGF5YWJsZUV2ZW50QXJnKSB7XHJcbiAgICB0aGlzLnNlbFBsYXlpbmcudHJhY2tEYXRhTm9kZSA9IGV2ZW50QXJnLnBsYXlhYmxlTm9kZVxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQgPSBldmVudEFyZy5jdXJyUGxheWFibGUuc2VsRWxcclxuICAgIHRoaXMuc2VsUGxheWluZy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLnRyYWNrX3VyaSA9IGV2ZW50QXJnLmN1cnJQbGF5YWJsZS51cmlcclxuXHJcbiAgICB0aGlzLndlYlBsYXllckVsLnBsYXlQYXVzZT8uY2xhc3NMaXN0LmFkZChjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICB0aGlzLndlYlBsYXllckVsLnNldFRpdGxlKGV2ZW50QXJnLmN1cnJQbGF5YWJsZS50aXRsZSlcclxuICAgIHRoaXMud2ViUGxheWVyRWwuc2V0SW1nU3JjKGV2ZW50QXJnLmN1cnJQbGF5YWJsZS5pbWFnZVVybClcclxuICAgIHRoaXMud2ViUGxheWVyRWwuc2V0QXJ0aXN0cyhldmVudEFyZy5jdXJyUGxheWFibGUuYXJ0aXN0c0h0bWwpXHJcblxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLnRyYWNrRGF0YU5vZGU/LmRhdGEub25QbGF5aW5nKClcclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25UcmFja0ZpbmlzaCAoKSB7XHJcbiAgICB0aGlzLmNvbXBsZXRlbHlEZXNlbGVjdFRyYWNrKClcclxuXHJcbiAgICB0aGlzLndlYlBsYXllckVsLnNvbmdQcm9ncmVzcyEuc2xpZGVyUHJvZ3Jlc3MhLnN0eWxlLndpZHRoID0gJzEwMCUnXHJcbiAgICBjbGVhckludGVydmFsKHRoaXMuZ2V0U3RhdGVJbnRlcnZhbCBhcyBOb2RlSlMuVGltZW91dClcclxuICAgIHRoaXMudHJ5UGxheU5leHQodGhpcy5zZWxQbGF5aW5nLnRyYWNrRGF0YU5vZGUpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIGFuIGludGVydmFsIHRoYXQgb2J0YWlucyB0aGUgc3RhdGUgb2YgdGhlIHBsYXllciBldmVyeSBzZWNvbmQuXHJcbiAgICogU2hvdWxkIG9ubHkgYmUgY2FsbGVkIHdoZW4gYSBzb25nIGlzIHBsYXlpbmcuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzZXRHZXRTdGF0ZUludGVydmFsICgpIHtcclxuICAgIGxldCBkdXJhdGlvbk1pblNlYyA9ICcnXHJcbiAgICBpZiAodGhpcy5nZXRTdGF0ZUludGVydmFsKSB7XHJcbiAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5nZXRTdGF0ZUludGVydmFsKVxyXG4gICAgfVxyXG4gICAgLy8gc2V0IHRoZSBpbnRlcnZhbCB0byBydW4gZXZlcnkgc2Vjb25kIGFuZCBvYnRhaW4gdGhlIHN0YXRlXHJcbiAgICB0aGlzLmdldFN0YXRlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgIHRoaXMucGxheWVyLmdldEN1cnJlbnRTdGF0ZSgpLnRoZW4oKHN0YXRlOiB7IHBvc2l0aW9uOiBhbnk7IGR1cmF0aW9uOiBhbnkgfSkgPT4ge1xyXG4gICAgICAgIGlmICghc3RhdGUpIHtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXHJcbiAgICAgICAgICAgICdVc2VyIGlzIG5vdCBwbGF5aW5nIG11c2ljIHRocm91Z2ggdGhlIFdlYiBQbGF5YmFjayBTREsnXHJcbiAgICAgICAgICApXHJcbiAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgeyBwb3NpdGlvbiwgZHVyYXRpb24gfSA9IHN0YXRlXHJcblxyXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzbnQgYSBkdXJhdGlvbiBzZXQgZm9yIHRoaXMgc29uZyBzZXQgaXQuXHJcbiAgICAgICAgaWYgKGR1cmF0aW9uTWluU2VjID09PSAnJykge1xyXG4gICAgICAgICAgZHVyYXRpb25NaW5TZWMgPSBtaWxsaXNUb01pbnV0ZXNBbmRTZWNvbmRzKGR1cmF0aW9uKVxyXG4gICAgICAgICAgdGhpcy53ZWJQbGF5ZXJFbCEuZHVyYXRpb24hLnRleHRDb250ZW50ID0gZHVyYXRpb25NaW5TZWNcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHBlcmNlbnREb25lID0gKHBvc2l0aW9uIC8gZHVyYXRpb24pICogMTAwXHJcblxyXG4gICAgICAgIC8vIHRoZSBwb3NpdGlvbiBnZXRzIHNldCB0byAwIHdoZW4gdGhlIHNvbmcgaXMgZmluaXNoZWRcclxuICAgICAgICBpZiAocG9zaXRpb24gPT09IDApIHtcclxuICAgICAgICAgIHRoaXMub25UcmFja0ZpbmlzaCgpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIGlmIHRoZSBwb3NpdGlvbiBpc250IDAgdXBkYXRlIHRoZSB3ZWIgcGxheWVyIGVsZW1lbnRzXHJcbiAgICAgICAgICB0aGlzLndlYlBsYXllckVsLnVwZGF0ZUVsZW1lbnQocGVyY2VudERvbmUsIHBvc2l0aW9uKVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgIH0sIDUwMClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlbGVjdCBhIGNlcnRhaW4gcGxheS9wYXVzZSBlbGVtZW50IGFuZCBwbGF5IHRoZSBnaXZlbiB0cmFjayB1cmlcclxuICAgKiBhbmQgdW5zZWxlY3QgdGhlIHByZXZpb3VzIG9uZSB0aGVuIHBhdXNlIHRoZSBwcmV2aW91cyB0cmFja191cmkuXHJcbiAgICpcclxuICAgKiBUaGUgcmVhc3NpZ25pbmcgb2YgZWxlbWVudHMgaXMgaW4gdGhlIGNhc2UgdGhhdCB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCB0aHJvdWdoIHRoZSB3ZWIgcGxheWVyIGVsZW1lbnQsXHJcbiAgICogYXMgdGhlcmUgaXMgYSBjaGFuY2UgdGhhdCB0aGUgc2VsZWN0ZWQgcGxheWluZyBlbGVtZW50IGlzIGVpdGhlciBub24tZXhpc3RlbnQsIG9yIGlzIGRpZmZlcmVudCB0aGVuIHRoZW5cclxuICAgKiB0aGUgcHJldmlvdXMgaS5lLiByZXJlbmRlcmVkLCBvciBoYXMgYW4gZXF1aXZhbGVudCBlbGVtZW50IHdoZW4gb24gZm9yIGV4YW1wbGUgYSBkaWZmZXJlbnQgdGVybSB0YWIuXHJcbiAgICpcclxuICAgKiBSZWFzc2lnbmluZyBpcyBkb25lIHNvIHRoYXQgdGhlIHBvdGVudGlhbGx5IGRpZmZlcmVudCBlcXVpdmFsZW50IGVsZW1lbnQgY2FuIGFjdCBhcyB0aGUgaW5pdGlhbGx5XHJcbiAgICogc2VsZWN0ZWQgZWxlbWVudCwgaW4gc2hvd2luZyBwYXVzZS9wbGF5IHN5bWJvbHMgaW4gYWNjb3JkYW5jZSB0byB3aGV0aGVyIHRoZVxyXG4gICAqIHNvbmcgd2FzIHBhdXNlZC9wbGF5ZWQgdGhyb3VnaCB0aGUgd2ViIHBsYXllci5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7UGxheWFibGVFdmVudEFyZ30gZXZlbnRBcmcgLSBhIGNsYXNzIHRoYXQgY29udGFpbnMgdGhlIGN1cnJlbnQsIG5leHQgYW5kIHByZXZpb3VzIHRyYWNrcyB0byBwbGF5XHJcbiAgICovXHJcbiAgcHVibGljIGFzeW5jIHNldFNlbFBsYXlpbmdFbCAoZXZlbnRBcmc6IFBsYXlhYmxlRXZlbnRBcmcpIHtcclxuICAgIC8vIGlmIHRoZSBwbGF5ZXIgaXNuJ3QgcmVhZHkgd2UgY2Fubm90IGNvbnRpbnVlLlxyXG4gICAgaWYgKCF0aGlzLnBsYXllcklzUmVhZHkpIHtcclxuICAgICAgY29uc29sZS5sb2coJ3BsYXllciBpcyBub3QgcmVhZHknKVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIGlmICh0aGlzLmlzRXhlY3V0aW5nQWN0aW9uKSB7XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IHRydWVcclxuICAgIGlmICh0aGlzLnNlbFBsYXlpbmcuZWxlbWVudCAhPSBudWxsKSB7XHJcbiAgICAgIC8vIHN0b3AgdGhlIHByZXZpb3VzIHRyYWNrIHRoYXQgd2FzIHBsYXlpbmdcclxuICAgICAgdGhpcy5zZWxQbGF5aW5nLnRyYWNrRGF0YU5vZGU/LmRhdGEub25TdG9wcGVkKClcclxuICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmdldFN0YXRlSW50ZXJ2YWwgYXMgTm9kZUpTLlRpbWVvdXQpXHJcblxyXG4gICAgICAvLyByZWFzc2lnbiB0aGUgZWxlbWVudCBpZiBpdCBleGlzdHMgYXMgaXQgbWF5IGhhdmUgYmVlbiByZXJlbmRlcmVkIGFuZCB0aGVyZWZvcmUgdGhlIHByZXZpb3VzIHZhbHVlIGlzIHBvaW50aW5nIHRvIG5vdGhpbmdcclxuICAgICAgdGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLnNlbFBsYXlpbmcuZWxlbWVudC5pZCkgPz8gdGhpcy5zZWxQbGF5aW5nLmVsZW1lbnRcclxuXHJcbiAgICAgIC8vIGlmIGl0cyB0aGUgc2FtZSBlbGVtZW50IHRoZW4gcGF1c2VcclxuICAgICAgaWYgKHRoaXMuc2VsUGxheWluZy5lbGVtZW50LmlkID09PSBldmVudEFyZy5jdXJyUGxheWFibGUuc2VsRWwuaWQpIHtcclxuICAgICAgICB0aGlzLnBhdXNlRGVzZWxlY3RUcmFjaygpXHJcbiAgICAgICAgYXdhaXQgdGhpcy5wYXVzZSgpXHJcbiAgICAgICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IGZhbHNlXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gb3RoZXJ3aXNlIGNvbXBsZXRlbHkgZGVzZWxlY3QgdGhlIGN1cnJlbnQgdHJhY2sgYmVmb3JlIHNlbGVjdGluZyBhbm90aGVyIG9uZSB0byBwbGF5XHJcbiAgICAgICAgdGhpcy5jb21wbGV0ZWx5RGVzZWxlY3RUcmFjaygpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBwcmV2IHRyYWNrIHVyaSBpcyB0aGUgc2FtZSB0aGVuIHJlc3VtZSB0aGUgc29uZyBpbnN0ZWFkIG9mIHJlcGxheWluZyBpdC5cclxuICAgIGlmICh0aGlzLnNlbFBsYXlpbmcudHJhY2tfdXJpID09PSBldmVudEFyZy5jdXJyUGxheWFibGUudXJpKSB7XHJcbiAgICAgIC8vIHRoaXMgc2VsRWwgY291bGQgY29ycm9zcG9uZCB0byB0aGUgc2FtZSBzb25nIGJ1dCBpcyBhbiBlbGVtZW50IHRoYXQgaXMgbm9uLWV4aXN0ZW50LCBzbyByZWFzc2lnbiBpdCB0byBhIGVxdWl2YWxlbnQgZXhpc3RpbmcgZWxlbWVudCBpZiB0aGlzIGlzIHRoZSBjYXNlLlxyXG4gICAgICBldmVudEFyZy5jdXJyUGxheWFibGUuc2VsRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChldmVudEFyZy5jdXJyUGxheWFibGUuc2VsRWwuaWQpID8/IGV2ZW50QXJnLmN1cnJQbGF5YWJsZS5zZWxFbFxyXG5cclxuICAgICAgYXdhaXQgdGhpcy5zdGFydFRyYWNrKGFzeW5jICgpID0+IHRoaXMucmVzdW1lKCksIGV2ZW50QXJnKVxyXG4gICAgICB0aGlzLmlzRXhlY3V0aW5nQWN0aW9uID0gZmFsc2VcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgY29uc29sZS5sb2coJ3N0YXJ0IHRyYWNrJylcclxuICAgIGF3YWl0IHRoaXMuc3RhcnRUcmFjayhhc3luYyAoKSA9PiB0aGlzLnBsYXkoZXZlbnRBcmcuY3VyclBsYXlhYmxlLnVyaSksIGV2ZW50QXJnKVxyXG4gICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IGZhbHNlXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzeW5jIHN0YXJ0VHJhY2sgKHBsYXlpbmdBc3luY0Z1bmM6IEZ1bmN0aW9uLCBldmVudEFyZzogUGxheWFibGVFdmVudEFyZykge1xyXG4gICAgdGhpcy5zZWxlY3RUcmFjayhldmVudEFyZylcclxuXHJcbiAgICBhd2FpdCBwbGF5aW5nQXN5bmNGdW5jKClcclxuXHJcbiAgICAvLyBzZXQgcGxheWluZyBzdGF0ZSBvbmNlIHNvbmcgc3RhcnRzIHBsYXlpbmdcclxuICAgIHRoaXMuc2V0R2V0U3RhdGVJbnRlcnZhbCgpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQbGF5cyBhIHRyYWNrIHRocm91Z2ggdGhpcyBkZXZpY2UuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHJhY2tfdXJpIC0gdGhlIHRyYWNrIHVyaSB0byBwbGF5XHJcbiAgICogQHJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHRyYWNrIGhhcyBiZWVuIHBsYXllZCBzdWNjZXNmdWxseS5cclxuICAgKi9cclxuICBwcml2YXRlIGFzeW5jIHBsYXkgKHRyYWNrX3VyaTogc3RyaW5nKSB7XHJcbiAgICBhd2FpdCBwcm9taXNlSGFuZGxlcihcclxuICAgICAgYXhpb3MucHV0KGNvbmZpZy5VUkxzLnB1dFBsYXlUcmFjayh0aGlzLmRldmljZV9pZCwgdHJhY2tfdXJpKSlcclxuICAgIClcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgcmVzdW1lICgpIHtcclxuICAgIGF3YWl0IHRoaXMucGxheWVyLnJlc3VtZSgpXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzeW5jIHBhdXNlICgpIHtcclxuICAgIGF3YWl0IHRoaXMucGxheWVyLnBhdXNlKClcclxuICB9XHJcbn1cclxuXHJcbmNvbnN0IHNwb3RpZnlQbGF5YmFjayA9IG5ldyBTcG90aWZ5UGxheWJhY2soKVxyXG5cclxuaWYgKCh3aW5kb3cgYXMgYW55KS5ldmVudEFnZ3JlZ2F0b3IgPT09IHVuZGVmaW5lZCkge1xyXG4gIC8vIGNyZWF0ZSBhIGdsb2JhbCB2YXJpYWJsZSB0byBiZSB1c2VkXHJcbiAgKHdpbmRvdyBhcyBhbnkpLmV2ZW50QWdncmVnYXRvciA9IG5ldyBFdmVudEFnZ3JlZ2F0b3IoKVxyXG59XHJcbmNvbnN0IGV2ZW50QWdncmVnYXRvciA9ICh3aW5kb3cgYXMgYW55KS5ldmVudEFnZ3JlZ2F0b3IgYXMgRXZlbnRBZ2dyZWdhdG9yXHJcblxyXG4vLyBzdWJzY3JpYmUgdGhlIHNldFBsYXlpbmcgZWxlbWVudCBldmVudFxyXG5ldmVudEFnZ3JlZ2F0b3Iuc3Vic2NyaWJlKFBsYXlhYmxlRXZlbnRBcmcubmFtZSwgKGV2ZW50QXJnOiBQbGF5YWJsZUV2ZW50QXJnKSA9PlxyXG4gIHNwb3RpZnlQbGF5YmFjay5zZXRTZWxQbGF5aW5nRWwoZXZlbnRBcmcpXHJcbilcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1NhbWVQbGF5aW5nVVJJICh1cmk6IHN0cmluZykge1xyXG4gIHJldHVybiAoXHJcbiAgICB1cmkgPT09IHNwb3RpZnlQbGF5YmFjay5zZWxQbGF5aW5nLnRyYWNrX3VyaSAmJlxyXG4gICAgICBzcG90aWZ5UGxheWJhY2suc2VsUGxheWluZy5lbGVtZW50ICE9IG51bGxcclxuICApXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjaGVja0lmSXNQbGF5aW5nRWxBZnRlclJlcmVuZGVyICh1cmk6IHN0cmluZywgc2VsRWw6IEVsZW1lbnQsIHRyYWNrRGF0YU5vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4pIHtcclxuICBpZiAoaXNTYW1lUGxheWluZ1VSSSh1cmkpKSB7XHJcbiAgICAvLyBUaGlzIGVsZW1lbnQgd2FzIHBsYXlpbmcgYmVmb3JlIHJlcmVuZGVyaW5nIHNvIHNldCBpdCB0byBiZSB0aGUgY3VycmVudGx5IHBsYXlpbmcgb25lIGFnYWluXHJcbiAgICBzcG90aWZ5UGxheWJhY2suc2VsUGxheWluZy5lbGVtZW50ID0gc2VsRWxcclxuICAgIHNwb3RpZnlQbGF5YmFjay5zZWxQbGF5aW5nLnRyYWNrRGF0YU5vZGUgPSB0cmFja0RhdGFOb2RlXHJcbiAgfVxyXG59XHJcblxyXG4vLyBhcHBlbmQgYW4gaW52aXNpYmxlIGVsZW1lbnQgdGhlbiBkZXN0cm95IGl0IGFzIGEgd2F5IHRvIGxvYWQgdGhlIHBsYXkgYW5kIHBhdXNlIGltYWdlcyBmcm9tIGV4cHJlc3MuXHJcbmNvbnN0IHByZWxvYWRQbGF5UGF1c2VJbWdzSHRtbCA9IGA8ZGl2IHN0eWxlPVwiZGlzcGxheTogbm9uZVwiPjxpbWcgc3JjPVwiJHtjb25maWcuUEFUSFMucGxheUljb259XCIvPjxpbWcgc3JjPVwiJHtjb25maWcuUEFUSFMucGF1c2VJY29ufVwiLz48L2Rpdj5gXHJcbmNvbnN0IHByZWxvYWRQbGF5UGF1c2VJbWdzRWwgPSBodG1sVG9FbChwcmVsb2FkUGxheVBhdXNlSW1nc0h0bWwpIGFzIE5vZGVcclxuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChwcmVsb2FkUGxheVBhdXNlSW1nc0VsKVxyXG5kb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHByZWxvYWRQbGF5UGF1c2VJbWdzRWwpXHJcbiIsImltcG9ydCBTdWJzY3JpcHRpb24gZnJvbSAnLi9zdWJzY3JpcHRpb24nXHJcblxyXG4vKiogTGV0cyBzYXkgeW91IGhhdmUgdHdvIGRvb3JzIHRoYXQgd2lsbCBvcGVuIHRocm91Z2ggdGhlIHB1YiBzdWIgc3lzdGVtLiBXaGF0IHdpbGwgaGFwcGVuIGlzIHRoYXQgd2Ugd2lsbCBzdWJzY3JpYmUgb25lXHJcbiAqIG9uIGRvb3Igb3BlbiBldmVudC4gV2Ugd2lsbCB0aGVuIGhhdmUgdHdvIHB1Ymxpc2hlcnMgdGhhdCB3aWxsIGVhY2ggcHJvcGFnYXRlIGEgZGlmZmVyZW50IGRvb3IgdGhyb3VnaCB0aGUgYWdncmVnYXRvciBhdCBkaWZmZXJlbnQgcG9pbnRzLlxyXG4gKiBUaGUgYWdncmVnYXRvciB3aWxsIHRoZW4gZXhlY3V0ZSB0aGUgb24gZG9vciBvcGVuIHN1YnNjcmliZXIgYW5kIHBhc3MgaW4gdGhlIGRvb3IgZ2l2ZW4gYnkgZWl0aGVyIHB1Ymxpc2hlci5cclxuICovXHJcblxyXG4vKiogTWFuYWdlcyBzdWJzY3JpYmluZyBhbmQgcHVibGlzaGluZyBvZiBldmVudHMuXHJcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICogQW4gYXJnVHlwZSBpcyBvYnRhaW5lZCBieSB0YWtpbmcgdGhlICdDbGFzc0luc3RhbmNlJy5jb250cnVjdG9yLm5hbWUgb3IgJ0NsYXNzJy5uYW1lLlxyXG4gKiBTdWJzY3JpcHRpb25zIGFyZSBncm91cGVkIHRvZ2V0aGVyIGJ5IGFyZ1R5cGUgYW5kIHRoZWlyIGV2dCB0YWtlcyBhbiBhcmd1bWVudCB0aGF0IGlzIGFcclxuICogY2xhc3Mgd2l0aCB0aGUgY29uc3RydWN0b3IubmFtZSBvZiBhcmdUeXBlLlxyXG4gKlxyXG4gKi9cclxuY2xhc3MgRXZlbnRBZ2dyZWdhdG9yIHtcclxuICBzdWJzY3JpYmVyczogeyBba2V5OiBzdHJpbmddOiBBcnJheTxTdWJzY3JpcHRpb24+IH07XHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgLy8ga2V5IC0gdHlwZSwgdmFsdWUgLSBbXSBvZiBmdW5jdGlvbnMgdGhhdCB0YWtlIGEgY2VydGFpbiB2YWx1ZSBkZXBlbmRpbmcgb24gdGhlIHR5cGVcclxuICAgIHRoaXMuc3Vic2NyaWJlcnMgPSB7fVxyXG4gIH1cclxuXHJcbiAgLyoqIFN1YnNjcmliZXMgYSB0eXBlIG9mIGV2ZW50LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGFyZ1R5cGUgLSB0aGUgdHlwZSB0aGF0IHRoaXMgc3Vic2NyaWJlciBiZWxvbmdzIHRvby5cclxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBldmVudCAtIHRoZSBldmVudCB0aGF0IHRha2VzIHRoZSBzYW1lIGFyZ3MgYXMgYWxsIG90aGVyIGV2ZW50cyBvZiB0aGUgZ2l2ZW4gdHlwZS5cclxuICAgKi9cclxuICBzdWJzY3JpYmUgKGFyZ1R5cGU6IHN0cmluZywgZXZ0OiBGdW5jdGlvbikge1xyXG4gICAgY29uc3Qgc3Vic2NyaWJlciA9IG5ldyBTdWJzY3JpcHRpb24odGhpcywgZXZ0LCBhcmdUeXBlKVxyXG5cclxuICAgIGlmIChhcmdUeXBlIGluIHRoaXMuc3Vic2NyaWJlcnMpIHtcclxuICAgICAgdGhpcy5zdWJzY3JpYmVyc1thcmdUeXBlXS5wdXNoKHN1YnNjcmliZXIpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnN1YnNjcmliZXJzW2FyZ1R5cGVdID0gW3N1YnNjcmliZXJdXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogVW5zdWJzY3JpYmVzIGEgZ2l2ZW4gc3Vic2NyaXB0aW9uLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTdWJzY3JpcHRpb259IHN1YnNjcmlwdGlvblxyXG4gICAqL1xyXG4gIHVuc3Vic2NyaWJlIChzdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbikge1xyXG4gICAgaWYgKHN1YnNjcmlwdGlvbi5hcmdUeXBlIGluIHRoaXMuc3Vic2NyaWJlcnMpIHtcclxuICAgICAgLy8gZmlsdGVyIG91dCB0aGUgc3Vic2NyaXB0aW9uIGdpdmVuIGZyb20gdGhlIHN1YnNjcmliZXJzIGRpY3Rpb25hcnlcclxuICAgICAgY29uc3QgZmlsdGVyZWQgPSB0aGlzLnN1YnNjcmliZXJzW3N1YnNjcmlwdGlvbi5hcmdUeXBlXS5maWx0ZXIoZnVuY3Rpb24gKHN1Yikge1xyXG4gICAgICAgIHJldHVybiBzdWIuaWQgIT09IHN1YnNjcmlwdGlvbi5pZFxyXG4gICAgICB9KVxyXG5cclxuICAgICAgdGhpcy5zdWJzY3JpYmVyc1tzdWJzY3JpcHRpb24uYXJnVHlwZV0gPSBmaWx0ZXJlZFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFB1Ymxpc2hlcyBhbGwgc3Vic2NyaWJlcnMgdGhhdCB0YWtlIGFyZ3VtZW50cyBvZiBhIGdpdmVuIHR5cGUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge09iamVjdH0gYXJncyAtIGEgY2xhc3MgdGhhdCBjb250YWlucyBhcmd1bWVudHMgZm9yIHRoZSBldmVudC4gTXVzdCBiZSBhIGNsYXNzIGFzIHN1YnNjcmliZXJzIGFyZSBncm91cGVkIGJ5IHR5cGUuXHJcbiAgICovXHJcbiAgcHVibGlzaCAoYXJnczogT2JqZWN0KSB7XHJcbiAgICBjb25zdCBhcmdUeXBlID0gYXJncy5jb25zdHJ1Y3Rvci5uYW1lXHJcblxyXG4gICAgaWYgKGFyZ1R5cGUgaW4gdGhpcy5zdWJzY3JpYmVycykge1xyXG4gICAgICB0aGlzLnN1YnNjcmliZXJzW2FyZ1R5cGVdLmZvckVhY2goKHN1YnNjcmlwdGlvbikgPT4ge1xyXG4gICAgICAgIHN1YnNjcmlwdGlvbi5ldnQoYXJncylcclxuICAgICAgfSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ25vIHR5cGUgZm91bmQgZm9yIHB1Ymxpc2hpbmcnKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY2xlYXJTdWJzY3JpcHRpb25zICgpIHtcclxuICAgIHRoaXMuc3Vic2NyaWJlcnMgPSB7fVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRXZlbnRBZ2dyZWdhdG9yXHJcbiIsImltcG9ydCB7IElQbGF5YWJsZSB9IGZyb20gJy4uLy4uLy4uLy4uL3R5cGVzJ1xyXG5pbXBvcnQgeyBEb3VibHlMaW5rZWRMaXN0Tm9kZSB9IGZyb20gJy4uLy4uL2RvdWJseS1saW5rZWQtbGlzdCdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXlhYmxlRXZlbnRBcmcge1xyXG4gIGN1cnJQbGF5YWJsZTogSVBsYXlhYmxlO1xyXG4gIHBsYXlhYmxlTm9kZTogRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPlxyXG5cclxuICAvKiogVGFrZXMgaW4gdGhlIGN1cnJlbnQgdHJhY2sgdG8gcGxheSBhcyB3ZWxsIGFzIHRoZSBwcmV2IHRyYWNrcyBhbmQgbmV4dCB0cmFja3MgZnJvbSBpdC5cclxuICAgKiBOb3RlIHRoYXQgaXQgZG9lcyBub3QgdGFrZSBUcmFjayBpbnN0YW5jZXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0lQbGF5YWJsZX0gY3VyclRyYWNrIC0gb2JqZWN0IGNvbnRhaW5pbmcgZWxlbWVudCB0byBzZWxlY3QsIHRyYWNrX3VyaSwgYW5kIHRyYWNrIHRpdGxlLlxyXG4gICAqIEBwYXJhbSB7RG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPn0gdHJhY2tOb2RlIC0gbm9kZSB0aGF0IGFsbG93cyB1cyB0byB0cmF2ZXJzZSB0byBuZXh0IGFuZCBwcmV2aW91cyB0cmFjayBkYXRhcy5cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciAoY3VyclRyYWNrOiBJUGxheWFibGUsIHRyYWNrTm9kZTogRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPikge1xyXG4gICAgdGhpcy5jdXJyUGxheWFibGUgPSBjdXJyVHJhY2tcclxuICAgIHRoaXMucGxheWFibGVOb2RlID0gdHJhY2tOb2RlXHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBFdmVudEFnZ3JlZ2F0b3IgZnJvbSAnLi9hZ2dyZWdhdG9yJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3Vic2NyaXB0aW9uIHtcclxuICBldmVudEFnZ3JlZ2F0b3I6IEV2ZW50QWdncmVnYXRvcjtcclxuICBldnQ6IEZ1bmN0aW9uO1xyXG4gIGFyZ1R5cGU6IHN0cmluZztcclxuICBpZDogc3RyaW5nO1xyXG5cclxuICBjb25zdHJ1Y3RvciAoZXZlbnRBZ2dyZWdhdG9yOiBFdmVudEFnZ3JlZ2F0b3IsIGV2dDogRnVuY3Rpb24sIGFyZ1R5cGU6IHN0cmluZykge1xyXG4gICAgdGhpcy5ldmVudEFnZ3JlZ2F0b3IgPSBldmVudEFnZ3JlZ2F0b3JcclxuICAgIHRoaXMuZXZ0ID0gZXZ0XHJcbiAgICB0aGlzLmFyZ1R5cGUgPSBhcmdUeXBlXHJcbiAgICB0aGlzLmlkID0gRGF0ZS5ub3coKS50b1N0cmluZygzNikgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMilcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IGF4aW9zLCB7IEF4aW9zUmVzcG9uc2UgfSBmcm9tICdheGlvcydcclxuaW1wb3J0IHsgY29uZmlnLCBwcm9taXNlSGFuZGxlciB9IGZyb20gJy4uL2NvbmZpZydcclxuaW1wb3J0IFNlbGVjdGFibGVUYWJFbHMgZnJvbSAnLi9TZWxlY3RhYmxlVGFiRWxzJ1xyXG5cclxuZXhwb3J0IGVudW0gVEVSTVMge1xyXG4gICAgU0hPUlRfVEVSTSA9ICdzaG9ydF90ZXJtJyxcclxuICAgIE1JRF9URVJNID0gJ21lZGl1bV90ZXJtJyxcclxuICAgIExPTkdfVEVSTSA9ICdsb25nX3Rlcm0nXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIFRFUk1fVFlQRSB7XHJcbiAgICBBUlRJU1RTID0gJ2FydGlzdHMnLFxyXG4gICAgVFJBQ0tTID0gJ3RyYWNrcydcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRldGVybWluZVRlcm0gKHZhbDogc3RyaW5nKSA6IFRFUk1TIHtcclxuICBzd2l0Y2ggKHZhbCkge1xyXG4gICAgY2FzZSBURVJNUy5TSE9SVF9URVJNOlxyXG4gICAgICByZXR1cm4gVEVSTVMuU0hPUlRfVEVSTVxyXG4gICAgY2FzZSBURVJNUy5NSURfVEVSTTpcclxuICAgICAgcmV0dXJuIFRFUk1TLk1JRF9URVJNXHJcbiAgICBjYXNlIFRFUk1TLkxPTkdfVEVSTTpcclxuICAgICAgcmV0dXJuIFRFUk1TLkxPTkdfVEVSTVxyXG4gICAgZGVmYXVsdDpcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdOTyBDT1JSRUNUIFRFUk0gV0FTIEZPVU5EJylcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkVGVybSAodGVybVR5cGU6IFRFUk1fVFlQRSkgOiBQcm9taXNlPFRFUk1TPiB7XHJcbiAgY29uc3QgeyByZXMsIGVyciB9ID0gYXdhaXQgcHJvbWlzZUhhbmRsZXI8QXhpb3NSZXNwb25zZTxzdHJpbmcgfCBudWxsPj4oKGF4aW9zLnJlcXVlc3Q8c3RyaW5nIHwgbnVsbD4oeyBtZXRob2Q6ICdHRVQnLCB1cmw6IGNvbmZpZy5VUkxzLmdldFRlcm0odGVybVR5cGUpIH0pKSlcclxuICBpZiAoZXJyKSB7XHJcbiAgICByZXR1cm4gVEVSTVMuU0hPUlRfVEVSTVxyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4gZGV0ZXJtaW5lVGVybShyZXM/LmRhdGEgYXMgc3RyaW5nKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVUZXJtICh0ZXJtOiBURVJNUywgdGVybVR5cGU6IFRFUk1fVFlQRSkge1xyXG4gIGF3YWl0IHByb21pc2VIYW5kbGVyKGF4aW9zLnB1dChjb25maWcuVVJMcy5wdXRUZXJtKHRlcm0sIHRlcm1UeXBlKSkpXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXQgdGhlIGluZGV4IHRoYXQgcG9pbnRzIHRvIHRoZSB0YWIgZWxlbWVudHNcclxuICogQHBhcmFtIHRlcm0gdGhlIHRlcm0gcmVsYXRpbmcgdG8gdGhlIHRhYiBlbGVtZW50c1xyXG4gKiBAcmV0dXJucyB0aGUgaW5kZXggdG8gZmluZCB0aGUgdGFiIGVsZW1lbnRzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gSWR4RnJvbVRlcm0gKHRlcm06IFRFUk1TKSB7XHJcbiAgc3dpdGNoICh0ZXJtKSB7XHJcbiAgICBjYXNlIFRFUk1TLlNIT1JUX1RFUk06XHJcbiAgICAgIHJldHVybiAwXHJcbiAgICBjYXNlIFRFUk1TLk1JRF9URVJNOlxyXG4gICAgICByZXR1cm4gMVxyXG4gICAgY2FzZSBURVJNUy5MT05HX1RFUk06XHJcbiAgICAgIHJldHVybiAyXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0U3RhcnRUZXJtVGFiICh0ZXJtOiBURVJNUywgdGVybVRhYjogU2VsZWN0YWJsZVRhYkVscywgdGFiUGFyZW50OiBFbGVtZW50KSB7XHJcbiAgY29uc3QgaWR4ID0gSWR4RnJvbVRlcm0odGVybSlcclxuICBjb25zdCBidG4gPSB0YWJQYXJlbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2J1dHRvbicpW2lkeF1cclxuICBjb25zdCBib3JkZXIgPSB0YWJQYXJlbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWcuQ1NTLkNMQVNTRVMuYm9yZGVyQ292ZXIpW2lkeF1cclxuXHJcbiAgdGVybVRhYi5zZWxlY3ROZXdUYWIoYnRuLCBib3JkZXIpXHJcbn1cclxuIiwiaW1wb3J0IHtcclxuICBjb25maWcsXHJcbiAgaHRtbFRvRWwsXHJcbiAgbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyxcclxuICB0aHJvd0V4cHJlc3Npb24sXHJcbiAgcmVtb3ZlQWxsQ2hpbGROb2Rlc1xyXG59IGZyb20gJy4uL2NvbmZpZydcclxuXHJcbmNsYXNzIFNsaWRlciB7XHJcbiAgcHVibGljIGRyYWc6IGJvb2xlYW4gPSBmYWxzZTtcclxuICBwdWJsaWMgc2xpZGVyRWw6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XHJcbiAgcHVibGljIHNsaWRlclByb2dyZXNzOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xyXG4gIHByaXZhdGUgcGVyY2VudGFnZTogbnVtYmVyID0gMDtcclxuICBwdWJsaWMgbWF4OiBudW1iZXIgPSAwO1xyXG4gIHByaXZhdGUgdG9wVG9Cb3R0b206IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSBvbkRyYWdTdGFydDogKCkgPT4gdm9pZDtcclxuICBwcml2YXRlIG9uRHJhZ1N0b3A6IChwZXJjZW50YWdlOiBudW1iZXIpID0+IHZvaWQ7XHJcbiAgcHJpdmF0ZSBvbkRyYWdnaW5nOiAocGVyY2VudGFnZTogbnVtYmVyKSA9PiB2b2lkO1xyXG5cclxuICBjb25zdHJ1Y3RvciAoc3RhcnRQZXJjZW50YWdlOiBudW1iZXIsIG9uRHJhZ1N0b3A6IChwZXJjZW50YWdlOiBudW1iZXIpID0+IHZvaWQsIHRvcFRvQm90dG9tOiBib29sZWFuLCBvbkRyYWdTdGFydCA9ICgpID0+IHt9LCBvbkRyYWdnaW5nID0gKHBlcmNlbnRhZ2U6IG51bWJlcikgPT4ge30sIHNsaWRlckVsOiBIVE1MRWxlbWVudCkge1xyXG4gICAgdGhpcy5vbkRyYWdTdG9wID0gb25EcmFnU3RvcFxyXG4gICAgdGhpcy5vbkRyYWdTdGFydCA9IG9uRHJhZ1N0YXJ0XHJcbiAgICB0aGlzLm9uRHJhZ2dpbmcgPSBvbkRyYWdnaW5nXHJcbiAgICB0aGlzLnRvcFRvQm90dG9tID0gdG9wVG9Cb3R0b21cclxuICAgIHRoaXMucGVyY2VudGFnZSA9IHN0YXJ0UGVyY2VudGFnZVxyXG5cclxuICAgIHRoaXMuc2xpZGVyRWwgPSBzbGlkZXJFbFxyXG4gICAgdGhpcy5zbGlkZXJQcm9ncmVzcyA9IHNsaWRlckVsPy5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNvbmZpZy5DU1MuQ0xBU1NFUy5wcm9ncmVzcylbMF0gYXMgSFRNTEVsZW1lbnQgPz8gdGhyb3dFeHByZXNzaW9uKCdObyBwcm9ncmVzcyBiYXIgZm91bmQnKVxyXG5cclxuICAgIGlmICh0aGlzLnRvcFRvQm90dG9tKSB7XHJcbiAgICAgIC8vIGlmIGl0cyB0b3AgdG8gYm90dG9tIHdlIG11c3Qgcm90YXRlIHRoZSBlbGVtZW50IGR1ZSByZXZlcnNlZCBoZWlnaHQgY2hhbmdpbmdcclxuICAgICAgdGhpcy5zbGlkZXJFbCEuc3R5bGUudHJhbnNmb3JtID0gJ3JvdGF0ZXgoMTgwZGVnKSdcclxuICAgICAgdGhpcy5zbGlkZXJFbCEuc3R5bGUudHJhbnNmb3JtT3JpZ2luID0gJ3RyYW5zZm9ybS1vcmlnaW46IHRvcCdcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmNoYW5nZUJhckxlbmd0aCgpXHJcbiAgICB0aGlzLnNsaWRlclByb2dyZXNzIS5zdHlsZS5yZW1vdmVQcm9wZXJ0eSgnYmFja2dyb3VuZC1jb2xvcicpXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHVwZGF0ZUJhciAobW9zUG9zVmFsOiBudW1iZXIpIHtcclxuICAgIGxldCBwb3NpdGlvblxyXG4gICAgaWYgKHRoaXMudG9wVG9Cb3R0b20pIHtcclxuICAgICAgcG9zaXRpb24gPSBtb3NQb3NWYWwgLSB0aGlzLnNsaWRlckVsIS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS55XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBwb3NpdGlvbiA9IG1vc1Bvc1ZhbCAtIHRoaXMuc2xpZGVyRWwhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnhcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy50b3BUb0JvdHRvbSkge1xyXG4gICAgICAvLyBtaW51cyAxMDAgYmVjYXVzZSBtb2RpZnlpbmcgaGVpZ2h0IGlzIHJldmVyc2VkXHJcbiAgICAgIHRoaXMucGVyY2VudGFnZSA9IDEwMCAtICgxMDAgKiAocG9zaXRpb24gLyB0aGlzLnNsaWRlckVsIS5jbGllbnRIZWlnaHQpKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5wZXJjZW50YWdlID0gMTAwICogKHBvc2l0aW9uIC8gdGhpcy5zbGlkZXJFbCEuY2xpZW50V2lkdGgpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMucGVyY2VudGFnZSA+IDEwMCkge1xyXG4gICAgICB0aGlzLnBlcmNlbnRhZ2UgPSAxMDBcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnBlcmNlbnRhZ2UgPCAwKSB7XHJcbiAgICAgIHRoaXMucGVyY2VudGFnZSA9IDBcclxuICAgIH1cclxuICAgIHRoaXMuY2hhbmdlQmFyTGVuZ3RoKClcclxuICB9O1xyXG5cclxuICBwcml2YXRlIGNoYW5nZUJhckxlbmd0aCAoKSB7XHJcbiAgICAvLyBzZXQgYmFja2dyb3VuZCBjb2xvciBvZiBhbGwgbW92aW5nIHNsaWRlcnMgcHJvZ3Jlc3MgYXMgdGhlIHNwb3RpZnkgZ3JlZW5cclxuICAgIHRoaXMuc2xpZGVyUHJvZ3Jlc3MhLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjMWRiOTU0J1xyXG4gICAgaWYgKHRoaXMudG9wVG9Cb3R0b20pIHtcclxuICAgICAgdGhpcy5zbGlkZXJQcm9ncmVzcyEuc3R5bGUuaGVpZ2h0ID0gdGhpcy5wZXJjZW50YWdlICsgJyUnXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgdGhpcy5zbGlkZXJQcm9ncmVzcyEuc3R5bGUud2lkdGggPSB0aGlzLnBlcmNlbnRhZ2UgKyAnJSdcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBhZGRFdmVudExpc3RlbmVycyAoKSB7XHJcbiAgICB0aGlzLmFkZE1vdXNlRXZlbnRzKClcclxuICAgIHRoaXMuYWRkVG91Y2hFdmVudHMoKVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhZGRUb3VjaEV2ZW50cyAoKSB7XHJcbiAgICB0aGlzLnNsaWRlckVsPy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgKGV2dCkgPT4ge1xyXG4gICAgICB0aGlzLmRyYWcgPSB0cnVlXHJcbiAgICAgIGlmICh0aGlzLm9uRHJhZ1N0YXJ0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5vbkRyYWdTdGFydCgpXHJcbiAgICAgIH1cclxuICAgICAgdGhpcy51cGRhdGVCYXIoZXZ0LmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFgpXHJcbiAgICB9KVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgKGV2dCkgPT4ge1xyXG4gICAgICBpZiAodGhpcy5kcmFnKSB7XHJcbiAgICAgICAgdGhpcy5vbkRyYWdnaW5nKHRoaXMucGVyY2VudGFnZSlcclxuICAgICAgICB0aGlzLnVwZGF0ZUJhcihldnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WClcclxuICAgICAgfVxyXG4gICAgfSlcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgKCkgPT4ge1xyXG4gICAgICBpZiAodGhpcy5kcmFnKSB7XHJcbiAgICAgICAgdGhpcy5vbkRyYWdTdG9wKHRoaXMucGVyY2VudGFnZSlcclxuICAgICAgICAvLyByZW1vdmUgdGhlIGlubGluZSBjc3Mgc28gdGhhdCBpdHMgb3JpZ2luYWwgYmFja2dyb3VuZCBjb2xvciByZXR1cm5zXHJcbiAgICAgICAgdGhpcy5zbGlkZXJQcm9ncmVzcyEuc3R5bGUucmVtb3ZlUHJvcGVydHkoJ2JhY2tncm91bmQtY29sb3InKVxyXG4gICAgICAgIHRoaXMuZHJhZyA9IGZhbHNlXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFkZE1vdXNlRXZlbnRzICgpIHtcclxuICAgIHRoaXMuc2xpZGVyRWw/LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChldnQpID0+IHtcclxuICAgICAgdGhpcy5kcmFnID0gdHJ1ZVxyXG4gICAgICBpZiAodGhpcy5vbkRyYWdTdGFydCAhPT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMub25EcmFnU3RhcnQoKVxyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLnRvcFRvQm90dG9tKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVCYXIoZXZ0LmNsaWVudFkpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVCYXIoZXZ0LmNsaWVudFgpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZXZ0KSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLmRyYWcpIHtcclxuICAgICAgICB0aGlzLm9uRHJhZ2dpbmcodGhpcy5wZXJjZW50YWdlKVxyXG4gICAgICAgIGlmICh0aGlzLnRvcFRvQm90dG9tKSB7XHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZUJhcihldnQuY2xpZW50WSlcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy51cGRhdGVCYXIoZXZ0LmNsaWVudFgpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsICgpID0+IHtcclxuICAgICAgaWYgKHRoaXMuZHJhZykge1xyXG4gICAgICAgIHRoaXMub25EcmFnU3RvcCh0aGlzLnBlcmNlbnRhZ2UpXHJcbiAgICAgICAgLy8gcmVtb3ZlIHRoZSBpbmxpbmUgY3NzIHNvIHRoYXQgaXRzIG9yaWdpbmFsIGJhY2tncm91bmQgY29sb3IgcmV0dXJuc1xyXG4gICAgICAgIHRoaXMuc2xpZGVyUHJvZ3Jlc3MhLnN0eWxlLnJlbW92ZVByb3BlcnR5KCdiYWNrZ3JvdW5kLWNvbG9yJylcclxuICAgICAgICB0aGlzLmRyYWcgPSBmYWxzZVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3BvdGlmeVBsYXliYWNrRWxlbWVudCB7XHJcbiAgcHJpdmF0ZSB0aXRsZTogRWxlbWVudCB8IG51bGw7XHJcbiAgcHVibGljIGN1cnJUaW1lOiBFbGVtZW50IHwgbnVsbDtcclxuICBwdWJsaWMgZHVyYXRpb246IEVsZW1lbnQgfCBudWxsO1xyXG4gIHB1YmxpYyBwbGF5UGF1c2U6IEVsZW1lbnQgfCBudWxsO1xyXG4gIHB1YmxpYyBzb25nUHJvZ3Jlc3M6IFNsaWRlciB8IG51bGwgPSBudWxsO1xyXG4gIHByaXZhdGUgdm9sdW1lQmFyOiBTbGlkZXIgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgdGhpcy50aXRsZSA9IG51bGxcclxuICAgIHRoaXMuY3VyclRpbWUgPSBudWxsXHJcbiAgICB0aGlzLmR1cmF0aW9uID0gbnVsbFxyXG4gICAgdGhpcy5wbGF5UGF1c2UgPSBudWxsXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0QXJ0aXN0cyAoYXJ0aXN0SHRtbDogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBhcnRpc3ROYW1lRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXJBcnRpc3RzKVxyXG4gICAgaWYgKGFydGlzdE5hbWVFbCkge1xyXG4gICAgICByZW1vdmVBbGxDaGlsZE5vZGVzKGFydGlzdE5hbWVFbClcclxuICAgICAgYXJ0aXN0TmFtZUVsLmlubmVySFRNTCArPSBhcnRpc3RIdG1sXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0SW1nU3JjIChpbWdTcmM6IHN0cmluZykge1xyXG4gICAgY29uc3QgcGxheWVyVHJhY2tJbWcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy5wbGF5ZXJUcmFja0ltZykgYXMgSFRNTEltYWdlRWxlbWVudFxyXG4gICAgaWYgKHBsYXllclRyYWNrSW1nKSB7XHJcbiAgICAgIHBsYXllclRyYWNrSW1nLnNyYyA9IGltZ1NyY1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldFRpdGxlICh0aXRsZTogc3RyaW5nKSB7XHJcbiAgICBpZiAodGhpcy50aXRsZSA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RyeWluZyB0byBzZXQgdGl0bGUgYmVmb3JlIGl0IGlzIGFzc2lnbmVkJylcclxuICAgIH1cclxuICAgIHRoaXMudGl0bGUhLnRleHRDb250ZW50ID0gdGl0bGVcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRUaXRsZSAoKTogc3RyaW5nIHtcclxuICAgIGlmICh0aGlzLnRpdGxlID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignVHJ5aW5nIHRvIHNldCB0aXRsZSBiZWZvcmUgaXQgaXMgYXNzaWduZWQnKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMudGl0bGUudGV4dENvbnRlbnQgYXMgc3RyaW5nXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHBlbmQgdGhlIHdlYiBwbGF5ZXIgZWxlbWVudCB0byB0aGUgRE9NIGFsb25nIHdpdGggdGhlIGV2ZW50IGxpc3RlbmVycyBmb3IgdGhlIGJ1dHRvbnMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcGxheVByZXZGdW5jIHRoZSBmdW5jdGlvbiB0byBydW4gd2hlbiB0aGUgcGxheSBwcmV2aW91cyBidXR0b24gaXMgcHJlc3NlZCBvbiB0aGUgd2ViIHBsYXllci5cclxuICAgKiBAcGFyYW0gcGF1c2VGdW5jIHRoZSBmdW5jdGlvbiB0byBydW4gd2hlbiB0aGUgcGF1c2UvcGxheSBidXR0b24gaXMgcHJlc3NlZCBvbiB0aGUgd2ViIHBsYXllci5cclxuICAgKiBAcGFyYW0gcGxheU5leHRGdW5jIHRoZSBmdW5jdGlvbiB0byBydW4gd2hlbiB0aGUgcGxheSBuZXh0IGJ1dHRvbiBpcyBwcmVzc2VkIG9uIHRoZSB3ZWIgcGxheWVyLlxyXG4gICAqIEBwYXJhbSBvblNlZWtTdGFydCAtIG9uIGRyYWcgc3RhcnQgZXZlbnQgZm9yIHNvbmcgcHJvZ3Jlc3Mgc2xpZGVyXHJcbiAgICogQHBhcmFtIHNlZWtTb25nIC0gb24gZHJhZyBlbmQgZXZlbnQgdG8gc2VlayBzb25nIGZvciBzb25nIHByb2dyZXNzIHNsaWRlclxyXG4gICAqIEBwYXJhbSBvblNlZWtpbmcgLSBvbiBkcmFnZ2luZyBldmVudCBmb3Igc29uZyBwcm9ncmVzcyBzbGlkZXJcclxuICAgKiBAcGFyYW0gc2V0Vm9sdW1lIC0gb24gZHJhZ2dpbmcgYW5kIG9uIGRyYWcgZW5kIGV2ZW50IGZvciB2b2x1bWUgc2xpZGVyXHJcbiAgICogQHBhcmFtIGluaXRpYWxWb2x1bWUgLSB0aGUgaW5pdGlhbCB2b2x1bWUgdG8gc2V0IHRoZSBzbGlkZXIgYXRcclxuICAgKi9cclxuICBwdWJsaWMgYXBwZW5kV2ViUGxheWVySHRtbCAoXHJcbiAgICBwbGF5UHJldkZ1bmM6ICgpID0+IHZvaWQsXHJcbiAgICBwYXVzZUZ1bmM6ICgpID0+IHZvaWQsXHJcbiAgICBwbGF5TmV4dEZ1bmM6ICgpID0+IHZvaWQsXHJcbiAgICBvblNlZWtTdGFydDogKCkgPT4gdm9pZCxcclxuICAgIHNlZWtTb25nOiAocGVyY2VudGFnZTogbnVtYmVyKSA9PiB2b2lkLFxyXG4gICAgb25TZWVraW5nOiAocGVyY2VudGFnZTogbnVtYmVyKSA9PiB2b2lkLFxyXG4gICAgc2V0Vm9sdW1lOiAocGVyY2VudGFnZTogbnVtYmVyLCBzYXZlOiBib29sZWFuKSA9PiB2b2lkLFxyXG4gICAgaW5pdGlhbFZvbHVtZTogbnVtYmVyKSB7XHJcbiAgICBjb25zdCBodG1sID0gYFxyXG4gICAgPGFydGljbGUgaWQ9XCIke2NvbmZpZy5DU1MuSURzLndlYlBsYXllcn1cIiBjbGFzcz1cInJlc2l6ZS1kcmFnXCI+XHJcbiAgICAgIDxpbWcgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5jb2x1bW59XCIgc3JjPVwiJHtjb25maWcuUEFUSFMucHJvZmlsZVVzZXJ9XCIgYWx0PVwidHJhY2tcIiBpZD1cIiR7Y29uZmlnLkNTUy5JRHMucGxheWVyVHJhY2tJbWd9XCIvPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuY29sdW1ufVwiIHN0eWxlPVwiZmxleC1iYXNpczogMzAlOyBtYXgtd2lkdGg6IDE4LjV2dztcIj5cclxuICAgICAgICA8aDQgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXB9XCI+U2VsZWN0IGEgU29uZzwvaDQ+XHJcbiAgICAgICAgPHNwYW4gaWQ9XCIke2NvbmZpZy5DU1MuSURzLndlYlBsYXllckFydGlzdHN9XCI+PC9zcGFuPlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLndlYlBsYXllckNvbnRyb2xzfSAke2NvbmZpZy5DU1MuQ0xBU1NFUy5jb2x1bW59XCI+XHJcbiAgICAgICAgPGRpdj5cclxuICAgICAgICAgIDxhcnRpY2xlIGlkPVwid2ViLXBsYXllci1idXR0b25zXCI+XHJcbiAgICAgICAgICAgIDxidXR0b24gaWQ9XCIke2NvbmZpZy5DU1MuSURzLnBsYXlQcmV2fVwiIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZXhwYW5kT25Ib3Zlcn1cIj48aW1nIHNyYz1cIiR7Y29uZmlnLlBBVEhTLnBsYXlQcmV2fVwiIGFsdD1cInByZXZpb3VzXCIvPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8YnV0dG9uIGlkPVwiJHtjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXJQbGF5UGF1c2V9XCIgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5wbGF5QnRufVwiPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8YnV0dG9uIGlkPVwiJHtjb25maWcuQ1NTLklEcy5wbGF5TmV4dH1cIiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmV4cGFuZE9uSG92ZXJ9XCI+PGltZyBzcmM9XCIke2NvbmZpZy5QQVRIUy5wbGF5TmV4dH1cIiBhbHQ9XCJuZXh0XCIvPjwvYnV0dG9uPlxyXG4gICAgICAgICAgPC9hcnRpY2xlPlxyXG4gICAgICAgICAgPGRpdiBpZD1cIiR7Y29uZmlnLkNTUy5JRHMud2ViUGxheWVyVm9sdW1lfVwiIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuc2xpZGVyfVwiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucHJvZ3Jlc3N9XCI+PC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8ZGl2IGlkPVwiJHtjb25maWcuQ1NTLklEcy5wbGF5VGltZUJhcn1cIj5cclxuICAgICAgICAgIDxwPjA6MDA8L3A+XHJcbiAgICAgICAgICA8ZGl2IGlkPVwiJHtjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXJQcm9ncmVzc31cIiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnNsaWRlcn1cIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnByb2dyZXNzfVwiPjwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8cD4wOjAwPC9wPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvYXJ0aWNsZT5cclxuICAgIGBcclxuXHJcbiAgICBjb25zdCB3ZWJQbGF5ZXJFbCA9IGh0bWxUb0VsKGh0bWwpXHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZCh3ZWJQbGF5ZXJFbCBhcyBOb2RlKVxyXG4gICAgdGhpcy5nZXRXZWJQbGF5ZXJFbHMoXHJcbiAgICAgIG9uU2Vla1N0YXJ0LFxyXG4gICAgICBzZWVrU29uZyxcclxuICAgICAgb25TZWVraW5nLFxyXG4gICAgICBzZXRWb2x1bWUsXHJcbiAgICAgIGluaXRpYWxWb2x1bWUpXHJcbiAgICB0aGlzLmFzc2lnbkV2ZW50TGlzdGVuZXJzKFxyXG4gICAgICBwbGF5UHJldkZ1bmMsXHJcbiAgICAgIHBhdXNlRnVuYyxcclxuICAgICAgcGxheU5leHRGdW5jXHJcbiAgICApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHRoZSB3ZWIgcGxheWVyIGVsZW1lbnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcGVyY2VudERvbmUgdGhlIHBlcmNlbnQgb2YgdGhlIHNvbmcgdGhhdCBoYXMgYmVlbiBjb21wbGV0ZWRcclxuICAgKiBAcGFyYW0gcG9zaXRpb24gdGhlIGN1cnJlbnQgcG9zaXRpb24gaW4gbXMgdGhhdCBoYXMgYmVlbiBjb21wbGV0ZWRcclxuICAgKi9cclxuICBwdWJsaWMgdXBkYXRlRWxlbWVudCAocGVyY2VudERvbmU6IG51bWJlciwgcG9zaXRpb246IG51bWJlcikge1xyXG4gICAgLy8gaWYgdGhlIHVzZXIgaXMgZHJhZ2dpbmcgdGhlIHNvbmcgcHJvZ3Jlc3MgYmFyIGRvbid0IGF1dG8gdXBkYXRlXHJcbiAgICBpZiAocG9zaXRpb24gIT09IDAgJiYgIXRoaXMuc29uZ1Byb2dyZXNzIS5kcmFnKSB7XHJcbiAgICAgIC8vIHJvdW5kIGVhY2ggaW50ZXJ2YWwgdG8gdGhlIG5lYXJlc3Qgc2Vjb25kIHNvIHRoYXQgdGhlIG1vdmVtZW50IG9mIHByb2dyZXNzIGJhciBpcyBieSBzZWNvbmQuXHJcbiAgICAgIHRoaXMuc29uZ1Byb2dyZXNzIS5zbGlkZXJQcm9ncmVzcyEuc3R5bGUud2lkdGggPSBgJHtwZXJjZW50RG9uZX0lYFxyXG4gICAgICBpZiAodGhpcy5jdXJyVGltZSA9PSBudWxsKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDdXJyZW50IHRpbWUgZWxlbWVudCBpcyBudWxsJylcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmN1cnJUaW1lLnRleHRDb250ZW50ID0gbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyhwb3NpdGlvbilcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHJpZXZlIHRoZSB3ZWIgcGxheWVyIGVsZW1lbnRzIG9uY2UgdGhlIHdlYiBwbGF5ZXIgZWxlbWVudCBoYXMgYmVlbiBhcHBlbmVkZWQgdG8gdGhlIERPTS4gSW5pdGlhbGl6ZXMgU2xpZGVycy5cclxuICAgKiBAcGFyYW0gb25TZWVrU3RhcnQgLSBvbiBkcmFnIHN0YXJ0IGV2ZW50IGZvciBzb25nIHByb2dyZXNzIHNsaWRlclxyXG4gICAqIEBwYXJhbSBzZWVrU29uZyAtIG9uIGRyYWcgZW5kIGV2ZW50IHRvIHNlZWsgc29uZyBmb3Igc29uZyBwcm9ncmVzcyBzbGlkZXJcclxuICAgKiBAcGFyYW0gb25TZWVraW5nIC0gb24gZHJhZ2dpbmcgZXZlbnQgZm9yIHNvbmcgcHJvZ3Jlc3Mgc2xpZGVyXHJcbiAgICogQHBhcmFtIHNldFZvbHVtZSAtIG9uIGRyYWdnaW5nIGFuZCBvbiBkcmFnIGVuZCBldmVudCBmb3Igdm9sdW1lIHNsaWRlclxyXG4gICAqIEBwYXJhbSBpbml0aWFsVm9sdW1lIC0gdGhlIGluaXRpYWwgdm9sdW1lIHRvIHNldCB0aGUgc2xpZGVyIGF0XHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXRXZWJQbGF5ZXJFbHMgKFxyXG4gICAgb25TZWVrU3RhcnQ6ICgpID0+IHZvaWQsXHJcbiAgICBzZWVrU29uZzogKHBlcmNlbnRhZ2U6IG51bWJlcikgPT4gdm9pZCxcclxuICAgIG9uU2Vla2luZzogKHBlcmNlbnRhZ2U6IG51bWJlcikgPT4gdm9pZCxcclxuICAgIHNldFZvbHVtZTogKHBlcmNlbnRhZ2U6IG51bWJlciwgc2F2ZTogYm9vbGVhbikgPT4gdm9pZCxcclxuICAgIGluaXRpYWxWb2x1bWU6IG51bWJlcikge1xyXG4gICAgY29uc3Qgd2ViUGxheWVyRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXIpID8/IHRocm93RXhwcmVzc2lvbignd2ViIHBsYXllciBlbGVtZW50IGRvZXMgbm90IGV4aXN0JylcclxuICAgIGNvbnN0IHBsYXlUaW1lQmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMucGxheVRpbWVCYXIpID8/IHRocm93RXhwcmVzc2lvbigncGxheSB0aW1lIGJhciBlbGVtZW50IGRvZXMgbm90IGV4aXN0JylcclxuXHJcbiAgICBjb25zdCBzb25nU2xpZGVyRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXJQcm9ncmVzcykgYXMgSFRNTEVsZW1lbnQgPz8gdGhyb3dFeHByZXNzaW9uKCd3ZWIgcGxheWVyIHByb2dyZXNzIGJhciBkb2VzIG5vdCBleGlzdCcpXHJcbiAgICBjb25zdCB2b2x1bWVTbGlkZXJFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLndlYlBsYXllclZvbHVtZSkgYXMgSFRNTEVsZW1lbnQgPz8gdGhyb3dFeHByZXNzaW9uKCd3ZWIgcGxheWVyIHZvbHVtZSBiYXIgZG9lcyBub3QgZXhpc3QnKVxyXG5cclxuICAgIHRoaXMuc29uZ1Byb2dyZXNzID0gbmV3IFNsaWRlcigwLCBzZWVrU29uZywgZmFsc2UsIG9uU2Vla1N0YXJ0LCBvblNlZWtpbmcsIHNvbmdTbGlkZXJFbClcclxuICAgIHRoaXMudm9sdW1lQmFyID0gbmV3IFNsaWRlcihpbml0aWFsVm9sdW1lICogMTAwLCAocGVyY2VudGFnZSkgPT4gc2V0Vm9sdW1lKHBlcmNlbnRhZ2UsIGZhbHNlKSwgZmFsc2UsICgpID0+IHt9LCAocGVyY2VudGFnZSkgPT4gc2V0Vm9sdW1lKHBlcmNlbnRhZ2UsIHRydWUpLCB2b2x1bWVTbGlkZXJFbClcclxuXHJcbiAgICB0aGlzLnRpdGxlID0gd2ViUGxheWVyRWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2g0JylbMF0gYXMgRWxlbWVudCA/PyB0aHJvd0V4cHJlc3Npb24oJ3dlYiBwbGF5ZXIgdGl0bGUgZWxlbWVudCBkb2VzIG5vdCBleGlzdCcpXHJcblxyXG4gICAgLy8gZ2V0IHBsYXl0aW1lIGJhciBlbGVtZW50c1xyXG4gICAgdGhpcy5jdXJyVGltZSA9IHBsYXlUaW1lQmFyLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdwJylbMF0gYXMgRWxlbWVudCA/PyB0aHJvd0V4cHJlc3Npb24oJ3dlYiBwbGF5ZXIgY3VycmVudCB0aW1lIGVsZW1lbnQgZG9lcyBub3QgZXhpc3QnKVxyXG4gICAgdGhpcy5kdXJhdGlvbiA9IHBsYXlUaW1lQmFyLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdwJylbMV0gYXMgRWxlbWVudCA/PyB0aHJvd0V4cHJlc3Npb24oJ3dlYiBwbGF5ZXIgZHVyYXRpb24gdGltZSBlbGVtZW50IGRvZXMgbm90IGV4aXN0JylcclxuXHJcbiAgICB0aGlzLnBsYXlQYXVzZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLndlYlBsYXllclBsYXlQYXVzZSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFzc2lnbnMgdGhlIGV2ZW50cyB0byBydW4gb24gZWFjaCBidXR0b24gcHJlc3MgdGhhdCBleGlzdHMgb24gdGhlIHdlYiBwbGF5ZXIgZWxlbWVudC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBwbGF5UHJldkZ1bmMgZnVuY3Rpb24gdG8gcnVuIHdoZW4gcGxheSBwcmV2aW91cyBidXR0b24gaXMgcHJlc3NlZFxyXG4gICAqIEBwYXJhbSBwYXVzZUZ1bmMgZnVuY3Rpb24gdG8gcnVuIHdoZW4gcGxheS9wYXVzZSBidXR0b24gaXMgcHJlc3NlZFxyXG4gICAqIEBwYXJhbSBwbGF5TmV4dEZ1bmMgZnVuY3Rpb24gdG8gcnVuIHdoZW4gcGxheSBuZXh0IGJ1dHRvbiBpcyBwcmVzc2VkXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhc3NpZ25FdmVudExpc3RlbmVycyAoXHJcbiAgICBwbGF5UHJldkZ1bmM6ICgpID0+IHZvaWQsXHJcbiAgICBwYXVzZUZ1bmM6ICgpID0+IHZvaWQsXHJcbiAgICBwbGF5TmV4dEZ1bmM6ICgpID0+IHZvaWQpIHtcclxuICAgIGNvbnN0IHBsYXlQcmV2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMucGxheVByZXYpXHJcbiAgICBjb25zdCBwbGF5TmV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLnBsYXlOZXh0KVxyXG5cclxuICAgIHBsYXlQcmV2Py5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHBsYXlQcmV2RnVuYylcclxuICAgIHBsYXlOZXh0Py5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHBsYXlOZXh0RnVuYylcclxuXHJcbiAgICB0aGlzLnBsYXlQYXVzZT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBwYXVzZUZ1bmMpXHJcbiAgICB0aGlzLnNvbmdQcm9ncmVzcz8uYWRkRXZlbnRMaXN0ZW5lcnMoKVxyXG4gICAgdGhpcy52b2x1bWVCYXI/LmFkZEV2ZW50TGlzdGVuZXJzKClcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHtcclxuICBjb25maWcsXHJcbiAgbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyxcclxuICBodG1sVG9FbCxcclxuICBnZXRWYWxpZEltYWdlXHJcbn0gZnJvbSAnLi4vY29uZmlnJ1xyXG5pbXBvcnQge1xyXG4gIGNoZWNrSWZJc1BsYXlpbmdFbEFmdGVyUmVyZW5kZXIsXHJcbiAgaXNTYW1lUGxheWluZ1VSSVxyXG59IGZyb20gJy4vcGxheWJhY2stc2RrJ1xyXG5pbXBvcnQgQWxidW0gZnJvbSAnLi9hbGJ1bSdcclxuaW1wb3J0IENhcmQgZnJvbSAnLi9jYXJkJ1xyXG5pbXBvcnQgUGxheWFibGVFdmVudEFyZyBmcm9tICcuL3B1YnN1Yi9ldmVudC1hcmdzL3RyYWNrLXBsYXktYXJncydcclxuaW1wb3J0IHsgU3BvdGlmeUltZywgRmVhdHVyZXNEYXRhLCBJQXJ0aXN0VHJhY2tEYXRhLCBJUGxheWFibGUsIEV4dGVybmFsVXJscywgVHJhY2tEYXRhIH0gZnJvbSAnLi4vLi4vdHlwZXMnXHJcbmltcG9ydCBEb3VibHlMaW5rZWRMaXN0LCB7IERvdWJseUxpbmtlZExpc3ROb2RlIH0gZnJvbSAnLi4vY29tcG9uZW50cy9kb3VibHktbGlua2VkLWxpc3QnXHJcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcydcclxuaW1wb3J0IEV2ZW50QWdncmVnYXRvciBmcm9tICcuL3B1YnN1Yi9hZ2dyZWdhdG9yJ1xyXG5cclxuY29uc3QgZXZlbnRBZ2dyZWdhdG9yID0gKHdpbmRvdyBhcyBhbnkpLmV2ZW50QWdncmVnYXRvciBhcyBFdmVudEFnZ3JlZ2F0b3JcclxuXHJcbmNsYXNzIFRyYWNrIGV4dGVuZHMgQ2FyZCBpbXBsZW1lbnRzIElQbGF5YWJsZSB7XHJcbiAgcHJpdmF0ZSBleHRlcm5hbFVybHM6IEV4dGVybmFsVXJscztcclxuICBwcml2YXRlIF9pZDogc3RyaW5nO1xyXG4gIHByaXZhdGUgX3RpdGxlOiBzdHJpbmc7XHJcbiAgcHJpdmF0ZSBfZHVyYXRpb246IHN0cmluZztcclxuICBwcml2YXRlIF91cmk6IHN0cmluZztcclxuICBwcml2YXRlIF9kYXRlQWRkZWRUb1BsYXlsaXN0OiBEYXRlO1xyXG5cclxuICBwb3B1bGFyaXR5OiBzdHJpbmc7XHJcbiAgcmVsZWFzZURhdGU6IERhdGU7XHJcbiAgYWxidW06IEFsYnVtO1xyXG4gIGZlYXR1cmVzOiBGZWF0dXJlc0RhdGEgfCB1bmRlZmluZWQ7XHJcbiAgaW1hZ2VVcmw6IHN0cmluZztcclxuICBzZWxFbDogRWxlbWVudDtcclxuICBvblBsYXlpbmc6IEZ1bmN0aW9uXHJcbiAgb25TdG9wcGVkOiBGdW5jdGlvblxyXG4gIGFydGlzdHNIdG1sOiBzdHJpbmdcclxuXHJcbiAgcHVibGljIGdldCBpZCAoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLl9pZFxyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCB0aXRsZSAoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLl90aXRsZVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCB1cmkgKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy5fdXJpXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGRhdGVBZGRlZFRvUGxheWxpc3QgKCk6IERhdGUge1xyXG4gICAgcmV0dXJuIHRoaXMuX2RhdGVBZGRlZFRvUGxheWxpc3RcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXREYXRlQWRkZWRUb1BsYXlsaXN0ICh2YWw6IHN0cmluZyB8IG51bWJlciB8IERhdGUpIHtcclxuICAgIHRoaXMuX2RhdGVBZGRlZFRvUGxheWxpc3QgPSBuZXcgRGF0ZSh2YWwpXHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3RvciAocHJvcHM6IHsgdGl0bGU6IHN0cmluZzsgaW1hZ2VzOiBBcnJheTxTcG90aWZ5SW1nPjsgZHVyYXRpb246IG51bWJlcjsgdXJpOiBzdHJpbmc7IHBvcHVsYXJpdHk6IHN0cmluZzsgcmVsZWFzZURhdGU6IHN0cmluZzsgaWQ6IHN0cmluZzsgYWxidW06IEFsYnVtOyBleHRlcm5hbFVybHM6IEV4dGVybmFsVXJsczsgYXJ0aXN0czogQXJyYXk8dW5rbm93bj47IGlkeDogbnVtYmVyIH0pIHtcclxuICAgIHN1cGVyKClcclxuICAgIGNvbnN0IHtcclxuICAgICAgdGl0bGUsXHJcbiAgICAgIGltYWdlcyxcclxuICAgICAgZHVyYXRpb24sXHJcbiAgICAgIHVyaSxcclxuICAgICAgcG9wdWxhcml0eSxcclxuICAgICAgcmVsZWFzZURhdGUsXHJcbiAgICAgIGlkLFxyXG4gICAgICBhbGJ1bSxcclxuICAgICAgZXh0ZXJuYWxVcmxzLFxyXG4gICAgICBhcnRpc3RzXHJcbiAgICB9ID0gcHJvcHNcclxuXHJcbiAgICB0aGlzLmV4dGVybmFsVXJscyA9IGV4dGVybmFsVXJsc1xyXG4gICAgdGhpcy5faWQgPSBpZFxyXG4gICAgdGhpcy5fdGl0bGUgPSB0aXRsZVxyXG4gICAgdGhpcy5hcnRpc3RzSHRtbCA9IHRoaXMuZ2VuZXJhdGVIVE1MQXJ0aXN0TmFtZXMoYXJ0aXN0cylcclxuICAgIHRoaXMuX2R1cmF0aW9uID0gbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyhkdXJhdGlvbilcclxuICAgIHRoaXMuX2RhdGVBZGRlZFRvUGxheWxpc3QgPSBuZXcgRGF0ZSgpXHJcblxyXG4gICAgLy8gZWl0aGVyIHRoZSBub3JtYWwgdXJpLCBvciB0aGUgbGlua2VkX2Zyb20udXJpXHJcbiAgICB0aGlzLl91cmkgPSB1cmlcclxuICAgIHRoaXMucG9wdWxhcml0eSA9IHBvcHVsYXJpdHlcclxuICAgIHRoaXMucmVsZWFzZURhdGUgPSBuZXcgRGF0ZShyZWxlYXNlRGF0ZSlcclxuICAgIHRoaXMuYWxidW0gPSBhbGJ1bVxyXG4gICAgdGhpcy5mZWF0dXJlcyA9IHVuZGVmaW5lZFxyXG5cclxuICAgIHRoaXMuaW1hZ2VVcmwgPSBnZXRWYWxpZEltYWdlKGltYWdlcylcclxuICAgIHRoaXMuc2VsRWwgPSBodG1sVG9FbCgnPD48Lz4nKSBhcyBFbGVtZW50XHJcblxyXG4gICAgdGhpcy5vblBsYXlpbmcgPSAoKSA9PiB7fVxyXG4gICAgdGhpcy5vblN0b3BwZWQgPSAoKSA9PiB7fVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBmaWx0ZXJEYXRhRnJvbUFydGlzdHMgKGFydGlzdHM6IEFycmF5PHVua25vd24+KSB7XHJcbiAgICByZXR1cm4gYXJ0aXN0cy5tYXAoKGFydGlzdCkgPT4gYXJ0aXN0IGFzIElBcnRpc3RUcmFja0RhdGEpXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdlbmVyYXRlSFRNTEFydGlzdE5hbWVzIChhcnRpc3RzOiBBcnJheTx1bmtub3duPikge1xyXG4gICAgY29uc3QgYXJ0aXN0c0RhdGFzID0gdGhpcy5maWx0ZXJEYXRhRnJvbUFydGlzdHMoYXJ0aXN0cylcclxuICAgIGxldCBhcnRpc3ROYW1lcyA9ICcnXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFydGlzdHNEYXRhcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBjb25zdCBhcnRpc3QgPSBhcnRpc3RzRGF0YXNbaV1cclxuICAgICAgYXJ0aXN0TmFtZXMgKz0gYDxhIGhyZWY9XCIke2FydGlzdC5leHRlcm5hbF91cmxzLnNwb3RpZnl9XCIgdGFyZ2V0PVwiX2JsYW5rXCI+JHthcnRpc3QubmFtZX08L2E+YFxyXG5cclxuICAgICAgaWYgKGkgPCBhcnRpc3RzRGF0YXMubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgIGFydGlzdE5hbWVzICs9ICcsICdcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFydGlzdE5hbWVzXHJcbiAgfVxyXG5cclxuICAvKiogUHJvZHVjZXMgdGhlIGNhcmQgZWxlbWVudCBvZiB0aGlzIHRyYWNrLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGlkeCAtIFRoZSBjYXJkIGluZGV4IHRvIHVzZSBmb3IgdGhlIGVsZW1lbnRzIGlkIHN1ZmZpeFxyXG4gICAqIEByZXR1cm5zIHtDaGlsZE5vZGV9IC0gVGhlIGNvbnZlcnRlZCBodG1sIHN0cmluZyB0byBhbiBlbGVtZW50XHJcbiAgICovXHJcbiAgcHVibGljIGdldFRyYWNrQ2FyZEh0bWwgKGlkeDogbnVtYmVyLCB1bmFuaW1hdGVkQXBwZWFyID0gZmFsc2UpIDogTm9kZSB7XHJcbiAgICBjb25zdCBpZCA9IGAke2NvbmZpZy5DU1MuSURzLnRyYWNrUHJlZml4fSR7aWR4fWBcclxuICAgIHRoaXMuY2FyZElkID0gaWRcclxuICAgIGNvbnN0IGFwcGVhckNsYXNzID0gdW5hbmltYXRlZEFwcGVhciA/IGNvbmZpZy5DU1MuQ0xBU1NFUy5hcHBlYXIgOiAnJ1xyXG5cclxuICAgIGNvbnN0IGh0bWwgPSBgXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5yYW5rQ2FyZH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLmZhZGVJblxyXG4gICAgfSAke2FwcGVhckNsYXNzfVwiPlxyXG4gICAgICAgICAgICAgIDxoNCBpZD1cIiR7Y29uZmlnLkNTUy5JRHMucmFua31cIj4ke2lkeCArIDF9LjwvaDQ+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmZsaXBDYXJkfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMubm9TZWxlY3RcclxuICAgIH0gICR7Y29uZmlnLkNTUy5DTEFTU0VTLmV4cGFuZE9uSG92ZXJ9XCI+XHJcbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuY2FyZH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLmZsaXBDYXJkSW5uZXJcclxuICAgIH0gJHtjb25maWcuQ1NTLkNMQVNTRVMudHJhY2t9XCIgaWQ9XCIke3RoaXMuZ2V0Q2FyZElkKCl9XCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5mbGlwQ2FyZEZyb250XHJcbiAgICAgICAgICAgICAgICAgIH1cIiAgdGl0bGU9XCJDbGljayB0byB2aWV3IG1vcmUgSW5mb1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgJHtjb25maWcuQ1NTLkFUVFJJQlVURVMucmVzdHJpY3RGbGlwT25DbGlja309XCJ0cnVlXCIgaWQ9XCIke3RoaXMuX3VyaX1cIiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnBsYXlCdG59ICR7XHJcbiAgICAgICAgICAgICAgICBpc1NhbWVQbGF5aW5nVVJJKHRoaXMudXJpKSA/IGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZCA6ICcnXHJcbiAgICAgICAgICAgICAgfVwiIHRpdGxlPVwiQ2xpY2sgdG8gcGxheSBzb25nXCI+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9XCIke3RoaXMuaW1hZ2VVcmx9XCIgYWx0PVwiQWxidW0gQ292ZXJcIj48L2ltZz5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGg0IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMuc2Nyb2xsaW5nVGV4dFxyXG4gICAgfVwiPiR7dGhpcy50aXRsZX08L2g0PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0ke2NvbmZpZy5DU1MuQ0xBU1NFUy5mbGlwQ2FyZEJhY2t9PlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMz5EdXJhdGlvbjo8L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgIDxwPiR7dGhpcy5fZHVyYXRpb259PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMz5SZWxlYXNlIERhdGU6PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICA8cD4ke3RoaXMucmVsZWFzZURhdGUudG9EYXRlU3RyaW5nKCl9PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMz5BbGJ1bSBOYW1lOjwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cIiR7dGhpcy5leHRlcm5hbFVybHMuc3BvdGlmeX1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxwICR7Y29uZmlnLkNTUy5BVFRSSUJVVEVTLnJlc3RyaWN0RmxpcE9uQ2xpY2t9PVwidHJ1ZVwiIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfVwiPiR7XHJcbiAgICAgIHRoaXMuYWxidW0ubmFtZVxyXG4gICAgfTwvcD5cclxuICAgICAgICAgICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgYFxyXG5cclxuICAgIGNvbnN0IGVsID0gaHRtbFRvRWwoaHRtbCkgYXMgSFRNTEVsZW1lbnRcclxuICAgIGNvbnN0IHBsYXlCdG4gPSBlbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNvbmZpZy5DU1MuQ0xBU1NFUy5wbGF5QnRuKVswXVxyXG5cclxuICAgIHRoaXMuc2VsRWwgPSBwbGF5QnRuXHJcblxyXG4gICAgcGxheUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgY29uc3QgdHJhY2tOb2RlID0gbmV3IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4odGhpcylcclxuICAgICAgdGhpcy5wbGF5UGF1c2VDbGljayh0cmFja05vZGUpXHJcbiAgICB9KVxyXG5cclxuICAgIHJldHVybiBlbCBhcyBOb2RlXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHBsYXlQYXVzZUNsaWNrICh0cmFja05vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4pIHtcclxuICAgIGNvbnN0IHRyYWNrID0gdGhpcyBhcyBJUGxheWFibGVcclxuICAgIC8vIHNlbGVjdCB0aGlzIHRyYWNrIHRvIHBsYXkgb3IgcGF1c2UgYnkgcHVibGlzaGluZyB0aGUgdHJhY2sgcGxheSBldmVudCBhcmdcclxuICAgIGV2ZW50QWdncmVnYXRvci5wdWJsaXNoKG5ldyBQbGF5YWJsZUV2ZW50QXJnKHRyYWNrLCB0cmFja05vZGUpKVxyXG4gIH1cclxuXHJcbiAgLyoqIEdldCBhIHRyYWNrIGh0bWwgdG8gYmUgcGxhY2VkIGFzIGEgbGlzdCBlbGVtZW50LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCb29sZWFufSBkaXNwbGF5RGF0ZSAtIHdoZXRoZXIgdG8gZGlzcGxheSB0aGUgZGF0ZS5cclxuICAgKiBAcmV0dXJucyB7Q2hpbGROb2RlfSAtIFRoZSBjb252ZXJ0ZWQgaHRtbCBzdHJpbmcgdG8gYW4gZWxlbWVudFxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRQbGF5bGlzdFRyYWNrSHRtbCAodHJhY2tMaXN0OiBEb3VibHlMaW5rZWRMaXN0PElQbGF5YWJsZT4sIGRpc3BsYXlEYXRlOiBib29sZWFuID0gdHJ1ZSk6IE5vZGUge1xyXG4gICAgY29uc3QgdHJhY2tOb2RlID0gdHJhY2tMaXN0LmZpbmQoKHgpID0+IHgudXJpID09PSB0aGlzLnVyaSwgdHJ1ZSkgYXMgRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPlxyXG4gICAgLy8gZm9yIHRoZSB1bmlxdWUgcGxheSBwYXVzZSBJRCBhbHNvIHVzZSB0aGUgZGF0ZSBhZGRlZCB0byBwbGF5bGlzdCBhcyB0aGVyZSBjYW4gYmUgZHVwbGljYXRlcyBvZiBhIHNvbmcgaW4gYSBwbGF5bGlzdC5cclxuICAgIGNvbnN0IHBsYXlQYXVzZUlkID0gdGhpcy5fdXJpICsgdGhpcy5kYXRlQWRkZWRUb1BsYXlsaXN0XHJcblxyXG4gICAgY29uc3QgaHRtbCA9IGBcclxuICAgICAgICAgICAgPGxpIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucGxheWxpc3RUcmFja31cIj5cclxuICAgICAgICAgICAgICA8YnV0dG9uIGlkPVwiJHtwbGF5UGF1c2VJZH1cIiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnBsYXlCdG59ICR7XHJcbiAgICAgICAgICAgICAgICBpc1NhbWVQbGF5aW5nVVJJKHRoaXMudXJpKSA/IGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZCA6ICcnXHJcbiAgICAgICAgICAgICAgfVwiPlxyXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDxpbWcgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5ub1NlbGVjdH1cIiBzcmM9XCIke1xyXG4gICAgICB0aGlzLmltYWdlVXJsXHJcbiAgICB9XCI+PC9pbWc+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmxpbmtzfVwiPlxyXG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cIiR7dGhpcy5leHRlcm5hbFVybHMuc3BvdGlmeX1cIiB0YXJnZXQ9XCJfYmxhbmtcIj5cclxuICAgICAgICAgICAgICAgICAgPGg0IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMubmFtZVxyXG4gICAgfVwiPiR7dGhpcy50aXRsZX1cclxuICAgICAgICAgICAgICAgICAgPC9oND5cclxuICAgICAgICAgICAgICAgIDxhLz5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXB9XCI+XHJcbiAgICAgICAgICAgICAgICAgICR7dGhpcy5hcnRpc3RzSHRtbH1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxoNT4ke3RoaXMuX2R1cmF0aW9ufTwvaDU+XHJcbiAgICAgICAgICAgICAgJHtcclxuICAgICAgICAgICAgICAgIGRpc3BsYXlEYXRlXHJcbiAgICAgICAgICAgICAgICAgID8gYDxoNT4ke3RoaXMuZGF0ZUFkZGVkVG9QbGF5bGlzdC50b0xvY2FsZURhdGVTdHJpbmcoKX08L2g1PmBcclxuICAgICAgICAgICAgICAgICAgOiAnJ1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgPC9saT5cclxuICAgICAgICAgICAgYFxyXG5cclxuICAgIGNvbnN0IGVsID0gaHRtbFRvRWwoaHRtbClcclxuXHJcbiAgICAvLyBnZXQgcGxheSBwYXVzZSBidXR0b25cclxuICAgIGNvbnN0IHBsYXlQYXVzZUJ0biA9IGVsPy5jaGlsZE5vZGVzWzFdXHJcbiAgICBpZiAocGxheVBhdXNlQnRuID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignUGxheSBwYXVzZSBidXR0b24gb24gdHJhY2sgd2FzIG5vdCBmb3VuZCcpXHJcbiAgICB9XHJcbiAgICB0aGlzLnNlbEVsID0gcGxheVBhdXNlQnRuIGFzIEVsZW1lbnRcclxuICAgIHBsYXlQYXVzZUJ0bj8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLnBsYXlQYXVzZUNsaWNrKHRyYWNrTm9kZSkpXHJcblxyXG4gICAgY2hlY2tJZklzUGxheWluZ0VsQWZ0ZXJSZXJlbmRlcih0aGlzLnVyaSwgcGxheVBhdXNlQnRuIGFzIEVsZW1lbnQsIHRyYWNrTm9kZSlcclxuXHJcbiAgICByZXR1cm4gZWwgYXMgTm9kZVxyXG4gIH1cclxuXHJcbiAgLyoqIEdldCBhIHRyYWNrIGh0bWwgdG8gYmUgcGxhY2VkIGFzIGEgbGlzdCBlbGVtZW50IG9uIGEgcmFua2VkIGxpc3QuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0RvdWJseUxpbmtlZExpc3Q8VHJhY2s+fSB0cmFja0xpc3QgLSBsaXN0IG9mIHRyYWNrcyB0aGF0IGNvbnRhaW5zIHRoaXMgdHJhY2suXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhbmsgLSB0aGUgcmFuayBvZiB0aGlzIGNhcmRcclxuICAgKiBAcmV0dXJucyB7Q2hpbGROb2RlfSAtIFRoZSBjb252ZXJ0ZWQgaHRtbCBzdHJpbmcgdG8gYW4gZWxlbWVudFxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRSYW5rZWRUcmFja0h0bWwgKHRyYWNrTGlzdDogRG91Ymx5TGlua2VkTGlzdDxUcmFjaz4sIHJhbms6IG51bWJlcik6IE5vZGUge1xyXG4gICAgY29uc3QgdHJhY2tOb2RlID0gdHJhY2tMaXN0LmZpbmQoKHgpID0+IHgudXJpID09PSB0aGlzLnVyaSwgdHJ1ZSkgYXMgRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPlxyXG4gICAgY29uc3QgaHRtbCA9IGBcclxuICAgICAgICAgICAgPGxpIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMucGxheWxpc3RUcmFja31cIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnJhbmtlZFRyYWNrSW50ZXJhY3R9ICR7XHJcbiAgICAgICAgICAgICAgICBpc1NhbWVQbGF5aW5nVVJJKHRoaXMudXJpKSA/IGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZCA6ICcnXHJcbiAgICAgICAgICAgICAgfVwiPlxyXG4gICAgICAgICAgICAgIDxidXR0b24gaWQ9XCIke3RoaXMuX3VyaX1cIiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnBsYXlCdG59ICR7XHJcbiAgICAgICAgICAgICAgICAgIGlzU2FtZVBsYXlpbmdVUkkodGhpcy51cmkpID8gY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkIDogJydcclxuICAgICAgICAgICAgICAgIH1cIj5cclxuICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8cD4ke3Jhbmt9LjwvcD5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGltZyBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLm5vU2VsZWN0fVwiIHNyYz1cIiR7XHJcbiAgICAgIHRoaXMuaW1hZ2VVcmxcclxuICAgIH1cIj48L2ltZz5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMubGlua3N9XCI+XHJcbiAgICAgICAgICAgICAgICA8YSBocmVmPVwiJHt0aGlzLmV4dGVybmFsVXJscy5zcG90aWZ5fVwiIHRhcmdldD1cIl9ibGFua1wiPlxyXG4gICAgICAgICAgICAgICAgICA8aDQgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXB9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5uYW1lXHJcbiAgICB9XCI+JHt0aGlzLnRpdGxlfVxyXG4gICAgICAgICAgICAgICAgICA8L2g0PlxyXG4gICAgICAgICAgICAgICAgPGEvPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcH1cIj5cclxuICAgICAgICAgICAgICAgICAgJHt0aGlzLmFydGlzdHNIdG1sfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGg1PiR7dGhpcy5fZHVyYXRpb259PC9oNT5cclxuICAgICAgICAgICAgPC9saT5cclxuICAgICAgICAgICAgYFxyXG5cclxuICAgIGNvbnN0IGVsID0gaHRtbFRvRWwoaHRtbClcclxuXHJcbiAgICAvLyBnZXQgcGxheSBwYXVzZSBidXR0b25cclxuICAgIGNvbnN0IHBsYXlQYXVzZUJ0biA9IGVsPy5jaGlsZE5vZGVzWzFdLmNoaWxkTm9kZXNbMV1cclxuXHJcbiAgICBpZiAocGxheVBhdXNlQnRuID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignUGxheSBwYXVzZSBidXR0b24gb24gdHJhY2sgd2FzIG5vdCBmb3VuZCcpXHJcbiAgICB9XHJcbiAgICB0aGlzLnNlbEVsID0gcGxheVBhdXNlQnRuIGFzIEVsZW1lbnRcclxuXHJcbiAgICAvLyBzZWxlY3QgdGhlIHJhbmsgYXJlYSBhcyB0byBrZWVwIHRoZSBwbGF5L3BhdXNlIGljb24gc2hvd25cclxuICAgIGNvbnN0IHJhbmtlZEludGVyYWN0ID0gKGVsIGFzIEhUTUxFbGVtZW50KS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNvbmZpZy5DU1MuQ0xBU1NFUy5yYW5rZWRUcmFja0ludGVyYWN0KVswXVxyXG4gICAgdGhpcy5vblBsYXlpbmcgPSAoKSA9PiByYW5rZWRJbnRlcmFjdC5jbGFzc0xpc3QuYWRkKGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZClcclxuICAgIHRoaXMub25TdG9wcGVkID0gKCkgPT4gcmFua2VkSW50ZXJhY3QuY2xhc3NMaXN0LnJlbW92ZShjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcblxyXG4gICAgcGxheVBhdXNlQnRuPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgdGhpcy5wbGF5UGF1c2VDbGljayh0cmFja05vZGUpXHJcbiAgICB9KVxyXG5cclxuICAgIGNoZWNrSWZJc1BsYXlpbmdFbEFmdGVyUmVyZW5kZXIodGhpcy51cmksIHBsYXlQYXVzZUJ0biBhcyBFbGVtZW50LCB0cmFja05vZGUpXHJcblxyXG4gICAgcmV0dXJuIGVsIGFzIE5vZGVcclxuICB9XHJcblxyXG4gIC8qKiBMb2FkIHRoZSBmZWF0dXJlcyBvZiB0aGlzIHRyYWNrIGZyb20gdGhlIHNwb3RpZnkgd2ViIGFwaS4gKi9cclxuICBwdWJsaWMgYXN5bmMgbG9hZEZlYXR1cmVzICgpIHtcclxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGF4aW9zXHJcbiAgICAgIC5nZXQoY29uZmlnLlVSTHMuZ2V0VHJhY2tGZWF0dXJlcyArIHRoaXMuaWQpXHJcbiAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgdGhyb3cgZXJyXHJcbiAgICAgIH0pXHJcbiAgICBjb25zdCBmZWF0cyA9IHJlcy5kYXRhLmF1ZGlvX2ZlYXR1cmVzXHJcbiAgICB0aGlzLmZlYXR1cmVzID0ge1xyXG4gICAgICBkYW5jZWFiaWxpdHk6IGZlYXRzLmRhbmNlYWJpbGl0eSxcclxuICAgICAgYWNvdXN0aWNuZXNzOiBmZWF0cy5hY291c3RpY25lc3MsXHJcbiAgICAgIGluc3RydW1lbnRhbG5lc3M6IGZlYXRzLmluc3RydW1lbnRhbG5lc3MsXHJcbiAgICAgIHZhbGVuY2U6IGZlYXRzLnZhbGVuY2UsXHJcbiAgICAgIGVuZXJneTogZmVhdHMuZW5lcmd5XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuZmVhdHVyZXNcclxuICB9XHJcbn1cclxuXHJcbi8qKiBHZW5lcmF0ZSB0cmFja3MgZnJvbSBkYXRhIGV4Y2x1ZGluZyBkYXRlIGFkZGVkLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0FycmF5PFRyYWNrRGF0YT59IGRhdGFzXHJcbiAqIEBwYXJhbSB7RG91Ymx5TGlua2VkTGlzdDxUcmFjaz4gfCBBcnJheTxUcmFjaz59IHRyYWNrcyAtIGRvdWJsZSBsaW5rZWQgbGlzdFxyXG4gKiBAcmV0dXJuc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlVHJhY2tzRnJvbURhdGEgKGRhdGFzOiBBcnJheTxUcmFja0RhdGE+LCB0cmFja3M6IERvdWJseUxpbmtlZExpc3Q8VHJhY2s+IHwgQXJyYXk8VHJhY2s+KSB7XHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhcy5sZW5ndGg7IGkrKykge1xyXG4gICAgY29uc3QgZGF0YSA9IGRhdGFzW2ldXHJcbiAgICBpZiAoZGF0YSkge1xyXG4gICAgICBjb25zdCBwcm9wcyA9IHtcclxuICAgICAgICB0aXRsZTogZGF0YS5uYW1lLFxyXG4gICAgICAgIGltYWdlczogZGF0YS5hbGJ1bS5pbWFnZXMsXHJcbiAgICAgICAgZHVyYXRpb246IGRhdGEuZHVyYXRpb25fbXMsXHJcbiAgICAgICAgdXJpOiBkYXRhLmxpbmtlZF9mcm9tICE9PSB1bmRlZmluZWQgPyBkYXRhLmxpbmtlZF9mcm9tLnVyaSA6IGRhdGEudXJpLFxyXG4gICAgICAgIHBvcHVsYXJpdHk6IGRhdGEucG9wdWxhcml0eSxcclxuICAgICAgICByZWxlYXNlRGF0ZTogZGF0YS5hbGJ1bS5yZWxlYXNlX2RhdGUsXHJcbiAgICAgICAgaWQ6IGRhdGEuaWQsXHJcbiAgICAgICAgYWxidW06IG5ldyBBbGJ1bShkYXRhLmFsYnVtLm5hbWUsIGRhdGEuYWxidW0uZXh0ZXJuYWxfdXJscy5zcG90aWZ5KSxcclxuICAgICAgICBleHRlcm5hbFVybHM6IGRhdGEuZXh0ZXJuYWxfdXJscyxcclxuICAgICAgICBhcnRpc3RzOiBkYXRhLmFydGlzdHMsXHJcbiAgICAgICAgaWR4OiBpXHJcbiAgICAgIH1cclxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodHJhY2tzKSkge1xyXG4gICAgICAgIHRyYWNrcy5wdXNoKG5ldyBUcmFjayhwcm9wcykpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdHJhY2tzLmFkZChuZXcgVHJhY2socHJvcHMpKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiB0cmFja3NcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVHJhY2tcclxuIiwiXHJcbmltcG9ydCB7IElQcm9taXNlSGFuZGxlclJldHVybiwgU3BvdGlmeUltZyB9IGZyb20gJy4uL3R5cGVzJ1xyXG5pbXBvcnQgeyBURVJNUywgVEVSTV9UWVBFIH0gZnJvbSAnLi9jb21wb25lbnRzL3NhdmUtbG9hZC10ZXJtJ1xyXG5pbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnXHJcblxyXG5jb25zdCBhdXRoRW5kcG9pbnQgPSAnaHR0cHM6Ly9hY2NvdW50cy5zcG90aWZ5LmNvbS9hdXRob3JpemUnXHJcbi8vIFJlcGxhY2Ugd2l0aCB5b3VyIGFwcCdzIGNsaWVudCBJRCwgcmVkaXJlY3QgVVJJIGFuZCBkZXNpcmVkIHNjb3Blc1xyXG5jb25zdCByZWRpcmVjdFVyaSA9ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnXHJcbmNvbnN0IGNsaWVudElkID0gJzQzNGY1ZTlmNDQyYTRlNDU4NmUwODlhMzNmNjVjODU3J1xyXG5jb25zdCBzY29wZXMgPSBbXHJcbiAgJ3VnYy1pbWFnZS11cGxvYWQnLFxyXG4gICd1c2VyLXJlYWQtcGxheWJhY2stc3RhdGUnLFxyXG4gICd1c2VyLW1vZGlmeS1wbGF5YmFjay1zdGF0ZScsXHJcbiAgJ3VzZXItcmVhZC1jdXJyZW50bHktcGxheWluZycsXHJcbiAgJ3N0cmVhbWluZycsXHJcbiAgJ2FwcC1yZW1vdGUtY29udHJvbCcsXHJcbiAgJ3VzZXItcmVhZC1lbWFpbCcsXHJcbiAgJ3VzZXItcmVhZC1wcml2YXRlJyxcclxuICAncGxheWxpc3QtcmVhZC1jb2xsYWJvcmF0aXZlJyxcclxuICAncGxheWxpc3QtbW9kaWZ5LXB1YmxpYycsXHJcbiAgJ3BsYXlsaXN0LXJlYWQtcHJpdmF0ZScsXHJcbiAgJ3BsYXlsaXN0LW1vZGlmeS1wcml2YXRlJyxcclxuICAndXNlci1saWJyYXJ5LW1vZGlmeScsXHJcbiAgJ3VzZXItbGlicmFyeS1yZWFkJyxcclxuICAndXNlci10b3AtcmVhZCcsXHJcbiAgJ3VzZXItcmVhZC1wbGF5YmFjay1wb3NpdGlvbicsXHJcbiAgJ3VzZXItcmVhZC1yZWNlbnRseS1wbGF5ZWQnLFxyXG4gICd1c2VyLWZvbGxvdy1yZWFkJyxcclxuICAndXNlci1mb2xsb3ctbW9kaWZ5J1xyXG5dXHJcbmV4cG9ydCBjb25zdCBjb25maWcgPSB7XHJcbiAgQ1NTOiB7XHJcbiAgICBJRHM6IHtcclxuICAgICAgcmVtb3ZlRWFybHlBZGRlZDogJ3JlbW92ZS1lYXJseS1hZGRlZCcsXHJcbiAgICAgIGdldFRva2VuTG9hZGluZ1NwaW5uZXI6ICdnZXQtdG9rZW4tbG9hZGluZy1zcGlubmVyJyxcclxuICAgICAgcGxheWxpc3RDYXJkc0NvbnRhaW5lcjogJ3BsYXlsaXN0LWNhcmRzLWNvbnRhaW5lcicsXHJcbiAgICAgIHRyYWNrQ2FyZHNDb250YWluZXI6ICd0cmFjay1jYXJkcy1jb250YWluZXInLFxyXG4gICAgICBwbGF5bGlzdFByZWZpeDogJ3BsYXlsaXN0LScsXHJcbiAgICAgIHRyYWNrUHJlZml4OiAndHJhY2stJyxcclxuICAgICAgc3BvdGlmeUNvbnRhaW5lcjogJ3Nwb3RpZnktY29udGFpbmVyJyxcclxuICAgICAgaW5mb0NvbnRhaW5lcjogJ2luZm8tY29udGFpbmVyJyxcclxuICAgICAgYWxsb3dBY2Nlc3NIZWFkZXI6ICdhbGxvdy1hY2Nlc3MtaGVhZGVyJyxcclxuICAgICAgZXhwYW5kZWRQbGF5bGlzdE1vZHM6ICdleHBhbmRlZC1wbGF5bGlzdC1tb2RzJyxcclxuICAgICAgcGxheWxpc3RNb2RzOiAncGxheWxpc3QtbW9kcycsXHJcbiAgICAgIHRyYWNrc0RhdGE6ICd0cmFja3MtZGF0YScsXHJcbiAgICAgIHRyYWNrc0NoYXJ0OiAndHJhY2tzLWNoYXJ0JyxcclxuICAgICAgdHJhY2tzVGVybVNlbGVjdGlvbnM6ICd0cmFja3MtdGVybS1zZWxlY3Rpb25zJyxcclxuICAgICAgZmVhdHVyZVNlbGVjdGlvbnM6ICdmZWF0dXJlLXNlbGVjdGlvbnMnLFxyXG4gICAgICBwbGF5bGlzdHNTZWN0aW9uOiAncGxheWxpc3RzLXNlY3Rpb24nLFxyXG4gICAgICB1bmRvOiAndW5kbycsXHJcbiAgICAgIHJlZG86ICdyZWRvJyxcclxuICAgICAgbW9kc09wZW5lcjogJ21vZHMtb3BlbmVyJyxcclxuICAgICAgZmVhdERlZjogJ2ZlYXQtZGVmaW5pdGlvbicsXHJcbiAgICAgIGZlYXRBdmVyYWdlOiAnZmVhdC1hdmVyYWdlJyxcclxuICAgICAgcmFuazogJ3JhbmsnLFxyXG4gICAgICB2aWV3QWxsVG9wVHJhY2tzOiAndmlldy1hbGwtdG9wLXRyYWNrcycsXHJcbiAgICAgIGVtb2ppczogJ2Vtb2ppcycsXHJcbiAgICAgIGFydGlzdENhcmRzQ29udGFpbmVyOiAnYXJ0aXN0LWNhcmRzLWNvbnRhaW5lcicsXHJcbiAgICAgIGFydGlzdFByZWZpeDogJ2FydGlzdC0nLFxyXG4gICAgICBpbml0aWFsQ2FyZDogJ2luaXRpYWwtY2FyZCcsXHJcbiAgICAgIGNvbnZlcnRDYXJkOiAnY29udmVydC1jYXJkJyxcclxuICAgICAgYXJ0aXN0VGVybVNlbGVjdGlvbnM6ICdhcnRpc3RzLXRlcm0tc2VsZWN0aW9ucycsXHJcbiAgICAgIHByb2ZpbGVIZWFkZXI6ICdwcm9maWxlLWhlYWRlcicsXHJcbiAgICAgIGNsZWFyRGF0YTogJ2NsZWFyLWRhdGEnLFxyXG4gICAgICBsaWtlZFRyYWNrczogJ2xpa2VkLXRyYWNrcycsXHJcbiAgICAgIGZvbGxvd2VkQXJ0aXN0czogJ2ZvbGxvd2VkLWFydGlzdHMnLFxyXG4gICAgICB3ZWJQbGF5ZXI6ICd3ZWItcGxheWVyJyxcclxuICAgICAgcGxheVRpbWVCYXI6ICdwbGF5dGltZS1iYXInLFxyXG4gICAgICBwbGF5bGlzdEhlYWRlckFyZWE6ICdwbGF5bGlzdC1tYWluLWhlYWRlci1hcmVhJyxcclxuICAgICAgcGxheU5leHQ6ICdwbGF5LW5leHQnLFxyXG4gICAgICBwbGF5UHJldjogJ3BsYXktcHJldicsXHJcbiAgICAgIHdlYlBsYXllclBsYXlQYXVzZTogJ3BsYXktcGF1c2UtcGxheWVyJyxcclxuICAgICAgd2ViUGxheWVyVm9sdW1lOiAnd2ViLXBsYXllci12b2x1bWUtYmFyJyxcclxuICAgICAgd2ViUGxheWVyUHJvZ3Jlc3M6ICd3ZWItcGxheWVyLXByb2dyZXNzLWJhcicsXHJcbiAgICAgIHBsYXllclRyYWNrSW1nOiAncGxheWVyLXRyYWNrLWltZycsXHJcbiAgICAgIHdlYlBsYXllckFydGlzdHM6ICd3ZWItcGxheWVyLWFydGlzdHMnLFxyXG4gICAgICBnZW5lcmF0ZVBsYXlsaXN0OiAnZ2VuZXJhdGUtcGxheWxpc3QnLFxyXG4gICAgICBoaWRlU2hvd1BsYXlsaXN0VHh0OiAnaGlkZS1zaG93LXBsYXlsaXN0LXR4dCcsXHJcbiAgICAgIHRvcFRyYWNrc1RleHRGb3JtQ29udGFpbmVyOiAndGVybS10ZXh0LWZvcm0tY29udGFpbmVyJyxcclxuICAgICAgdXNlcm5hbWU6ICd1c2VybmFtZSdcclxuICAgIH0sXHJcbiAgICBDTEFTU0VTOiB7XHJcbiAgICAgIGdsb3c6ICdnbG93JyxcclxuICAgICAgcGxheWxpc3Q6ICdwbGF5bGlzdCcsXHJcbiAgICAgIHRyYWNrOiAndHJhY2snLFxyXG4gICAgICBhcnRpc3Q6ICdhcnRpc3QnLFxyXG4gICAgICByYW5rQ2FyZDogJ3JhbmstY2FyZCcsXHJcbiAgICAgIHBsYXlsaXN0VHJhY2s6ICdwbGF5bGlzdC10cmFjaycsXHJcbiAgICAgIGluZm9Mb2FkaW5nU3Bpbm5lcnM6ICdpbmZvLWxvYWRpbmctc3Bpbm5lcicsXHJcbiAgICAgIGFwcGVhcjogJ2FwcGVhcicsXHJcbiAgICAgIGhpZGU6ICdoaWRlJyxcclxuICAgICAgc2VsZWN0ZWQ6ICdzZWxlY3RlZCcsXHJcbiAgICAgIGNhcmQ6ICdjYXJkJyxcclxuICAgICAgcGxheWxpc3RTZWFyY2g6ICdwbGF5bGlzdC1zZWFyY2gnLFxyXG4gICAgICBlbGxpcHNpc1dyYXA6ICdlbGxpcHNpcy13cmFwJyxcclxuICAgICAgbmFtZTogJ25hbWUnLFxyXG4gICAgICBwbGF5bGlzdE9yZGVyOiAncGxheWxpc3Qtb3JkZXInLFxyXG4gICAgICBjaGFydEluZm86ICdjaGFydC1pbmZvJyxcclxuICAgICAgZmxpcENhcmRJbm5lcjogJ2ZsaXAtY2FyZC1pbm5lcicsXHJcbiAgICAgIGZsaXBDYXJkRnJvbnQ6ICdmbGlwLWNhcmQtZnJvbnQnLFxyXG4gICAgICBmbGlwQ2FyZEJhY2s6ICdmbGlwLWNhcmQtYmFjaycsXHJcbiAgICAgIGZsaXBDYXJkOiAnZmxpcC1jYXJkJyxcclxuICAgICAgcmVzaXplQ29udGFpbmVyOiAncmVzaXplLWNvbnRhaW5lcicsXHJcbiAgICAgIHNjcm9sbExlZnQ6ICdzY3JvbGwtbGVmdCcsXHJcbiAgICAgIHNjcm9sbGluZ1RleHQ6ICdzY3JvbGxpbmctdGV4dCcsXHJcbiAgICAgIG5vU2VsZWN0OiAnbm8tc2VsZWN0JyxcclxuICAgICAgZHJvcERvd246ICdkcm9wLWRvd24nLFxyXG4gICAgICBleHBhbmRhYmxlVHh0Q29udGFpbmVyOiAnZXhwYW5kYWJsZS10ZXh0LWNvbnRhaW5lcicsXHJcbiAgICAgIGJvcmRlckNvdmVyOiAnYm9yZGVyLWNvdmVyJyxcclxuICAgICAgZmlyc3RFeHBhbnNpb246ICdmaXJzdC1leHBhbnNpb24nLFxyXG4gICAgICBzZWNvbmRFeHBhbnNpb246ICdzZWNvbmQtZXhwYW5zaW9uJyxcclxuICAgICAgaW52aXNpYmxlOiAnaW52aXNpYmxlJyxcclxuICAgICAgZmFkZUluOiAnZmFkZS1pbicsXHJcbiAgICAgIGZyb21Ub3A6ICdmcm9tLXRvcCcsXHJcbiAgICAgIGV4cGFuZE9uSG92ZXI6ICdleHBhbmQtb24taG92ZXInLFxyXG4gICAgICB0cmFja3NBcmVhOiAndHJhY2tzLWFyZWEnLFxyXG4gICAgICBzY3JvbGxCYXI6ICdzY3JvbGwtYmFyJyxcclxuICAgICAgdHJhY2tMaXN0OiAndHJhY2stbGlzdCcsXHJcbiAgICAgIGFydGlzdFRvcFRyYWNrczogJ2FydGlzdC10b3AtdHJhY2tzJyxcclxuICAgICAgdGV4dEZvcm06ICd0ZXh0LWZvcm0nLFxyXG4gICAgICBjb250ZW50OiAnY29udGVudCcsXHJcbiAgICAgIGxpbmtzOiAnbGlua3MnLFxyXG4gICAgICBwcm9ncmVzczogJ3Byb2dyZXNzJyxcclxuICAgICAgcGxheVBhdXNlOiAncGxheS1wYXVzZScsXHJcbiAgICAgIHJhbmtlZFRyYWNrSW50ZXJhY3Q6ICdyYW5rZWQtaW50ZXJhY3Rpb24tYXJlYScsXHJcbiAgICAgIHNsaWRlcjogJ3NsaWRlcicsXHJcbiAgICAgIHBsYXlCdG46ICdwbGF5LWJ0bicsXHJcbiAgICAgIGRpc3BsYXlOb25lOiAnZGlzcGxheS1ub25lJyxcclxuICAgICAgY29sdW1uOiAnY29sdW1uJyxcclxuICAgICAgd2ViUGxheWVyQ29udHJvbHM6ICd3ZWItcGxheWVyLWNvbnRyb2xzJ1xyXG4gICAgfSxcclxuICAgIEFUVFJJQlVURVM6IHtcclxuICAgICAgZGF0YVNlbGVjdGlvbjogJ2RhdGEtc2VsZWN0aW9uJyxcclxuICAgICAgcmVzdHJpY3RGbGlwT25DbGljazogJ2RhdGEtcmVzdHJpY3QtZmxpcC1vbi1jbGljaydcclxuICAgIH1cclxuICB9LFxyXG4gIFVSTHM6IHtcclxuICAgIHNpdGVVcmw6ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnLFxyXG4gICAgYXV0aDogYCR7YXV0aEVuZHBvaW50fT9jbGllbnRfaWQ9JHtjbGllbnRJZH0mcmVkaXJlY3RfdXJpPSR7cmVkaXJlY3RVcml9JnNjb3BlPSR7c2NvcGVzLmpvaW4oXHJcbiAgICAgICclMjAnXHJcbiAgICApfSZyZXNwb25zZV90eXBlPWNvZGUmc2hvd19kaWFsb2c9dHJ1ZWAsXHJcbiAgICBnZXRIYXNUb2tlbnM6ICcvdG9rZW5zL2hhcy10b2tlbnMnLFxyXG4gICAgZ2V0QWNjZXNzVG9rZW46ICcvdG9rZW5zL2dldC1hY2Nlc3MtdG9rZW4nLFxyXG4gICAgZ2V0T2J0YWluVG9rZW5zUHJlZml4OiAoY29kZTogc3RyaW5nKSA9PiBgL3Rva2Vucy9vYnRhaW4tdG9rZW5zP2NvZGU9JHtjb2RlfWAsXHJcbiAgICBnZXRUb3BBcnRpc3RzOiAnL3Nwb3RpZnkvZ2V0LXRvcC1hcnRpc3RzP3RpbWVfcmFuZ2U9JyxcclxuICAgIGdldFRvcFRyYWNrczogJy9zcG90aWZ5L2dldC10b3AtdHJhY2tzP3RpbWVfcmFuZ2U9JyxcclxuICAgIGdldFBsYXlsaXN0czogJy9zcG90aWZ5L2dldC1wbGF5bGlzdHMnLFxyXG4gICAgZ2V0UGxheWxpc3RUcmFja3M6ICcvc3BvdGlmeS9nZXQtcGxheWxpc3QtdHJhY2tzP3BsYXlsaXN0X2lkPScsXHJcbiAgICBwdXRDbGVhclRva2VuczogJy90b2tlbnMvY2xlYXItdG9rZW5zJyxcclxuICAgIGRlbGV0ZVBsYXlsaXN0VHJhY2tzOiAocGxheWxpc3RJZDogc3RyaW5nKSA9PiBgL3Nwb3RpZnkvZGVsZXRlLXBsYXlsaXN0LWl0ZW1zP3BsYXlsaXN0X2lkPSR7cGxheWxpc3RJZH1gLFxyXG4gICAgcG9zdFBsYXlsaXN0VHJhY2tzOiAocGxheWxpc3RJZDogc3RyaW5nKSA9PiBgL3Nwb3RpZnkvcG9zdC1wbGF5bGlzdC1pdGVtcz9wbGF5bGlzdF9pZD0ke3BsYXlsaXN0SWR9YCxcclxuICAgIGdldFRyYWNrRmVhdHVyZXM6ICcvc3BvdGlmeS9nZXQtdHJhY2tzLWZlYXR1cmVzP3RyYWNrX2lkcz0nLFxyXG4gICAgcHV0UmVmcmVzaEFjY2Vzc1Rva2VuOiAnL3Rva2Vucy9yZWZyZXNoLXRva2VuJyxcclxuICAgIHB1dFNlc3Npb25EYXRhOiAnL3Nwb3RpZnkvcHV0LXNlc3Npb24tZGF0YT9hdHRyPScsXHJcbiAgICBwdXRQbGF5bGlzdFJlc2l6ZURhdGE6ICh2YWw6IHN0cmluZykgPT4gYC91c2VyL3B1dC1wbGF5bGlzdC1yZXNpemUtZGF0YT92YWw9JHt2YWx9YCxcclxuICAgIGdldFBsYXlsaXN0UmVzaXplRGF0YTogJy91c2VyL2dldC1wbGF5bGlzdC1yZXNpemUtZGF0YScsXHJcbiAgICBwdXRQbGF5bGlzdElzSW5UZXh0Rm9ybURhdGE6ICh2YWw6IHN0cmluZykgPT4gYC91c2VyL3B1dC1wbGF5bGlzdC10ZXh0LWZvcm0tZGF0YT92YWw9JHt2YWx9YCxcclxuICAgIGdldFBsYXlsaXN0SXNJblRleHRGb3JtRGF0YTogJy91c2VyL2dldC1wbGF5bGlzdC10ZXh0LWZvcm0tZGF0YScsXHJcbiAgICBwdXRUb3BUcmFja3NJc0luVGV4dEZvcm1EYXRhOiAodmFsOiBzdHJpbmcpID0+IGAvdXNlci9wdXQtdG9wLXRyYWNrcy10ZXh0LWZvcm0tZGF0YT92YWw9JHt2YWx9YCxcclxuICAgIGdldFRvcFRyYWNrc0lzSW5UZXh0Rm9ybURhdGE6ICcvdXNlci9nZXQtdG9wLXRyYWNrcy10ZXh0LWZvcm0tZGF0YScsXHJcbiAgICBnZXRBcnRpc3RUb3BUcmFja3M6IChpZDogc3RyaW5nKSA9PiBgL3Nwb3RpZnkvZ2V0LWFydGlzdC10b3AtdHJhY2tzP2lkPSR7aWR9YCxcclxuICAgIGdldEN1cnJlbnRVc2VyUHJvZmlsZTogJy9zcG90aWZ5L2dldC1jdXJyZW50LXVzZXItcHJvZmlsZScsXHJcbiAgICBwdXRDbGVhclNlc3Npb246ICcvY2xlYXItc2Vzc2lvbicsXHJcbiAgICBnZXRDdXJyZW50VXNlclNhdmVkVHJhY2tzOiAnL3Nwb3RpZnkvZ2V0LWN1cnJlbnQtdXNlci1zYXZlZC10cmFja3MnLFxyXG4gICAgZ2V0Rm9sbG93ZWRBcnRpc3RzOiAnL3Nwb3RpZnkvZ2V0LWZvbGxvd2VkLWFydGlzdHMnLFxyXG4gICAgcHV0UGxheVRyYWNrOiAoZGV2aWNlX2lkOiBzdHJpbmcsIHRyYWNrX3VyaTogc3RyaW5nKSA9PlxyXG4gICAgICBgL3Nwb3RpZnkvcGxheS10cmFjaz9kZXZpY2VfaWQ9JHtkZXZpY2VfaWR9JnRyYWNrX3VyaT0ke3RyYWNrX3VyaX1gLFxyXG4gICAgcHV0UGxheWVyVm9sdW1lRGF0YTogKHZhbDogc3RyaW5nKSA9PiBgL3VzZXIvcHV0LXBsYXllci12b2x1bWU/dmFsPSR7dmFsfWAsXHJcbiAgICBnZXRQbGF5ZXJWb2x1bWVEYXRhOiAnL3VzZXIvZ2V0LXBsYXllci12b2x1bWUnLFxyXG4gICAgcHV0VGVybTogKHRlcm06IFRFUk1TLCB0ZXJtVHlwZTogVEVSTV9UWVBFKSA9PiBgL3VzZXIvcHV0LXRvcC0ke3Rlcm1UeXBlfS10ZXJtP3Rlcm09JHt0ZXJtfWAsXHJcbiAgICBnZXRUZXJtOiAodGVybVR5cGU6IFRFUk1fVFlQRSkgPT4gYC91c2VyL2dldC10b3AtJHt0ZXJtVHlwZX0tdGVybWAsXHJcbiAgICBwdXRDdXJyUGxheWxpc3RJZDogKGlkOiBzdHJpbmcpID0+IGAvdXNlci9wdXQtY3VycmVudC1wbGF5bGlzdC1pZD9pZD0ke2lkfWAsXHJcbiAgICBnZXRDdXJyUGxheWxpc3RJZDogJy91c2VyL2dldC1jdXJyZW50LXBsYXlsaXN0LWlkJyxcclxuICAgIHBvc3RQbGF5bGlzdDogKG5hbWU6IHN0cmluZykgPT4gYC9zcG90aWZ5L3Bvc3QtcGxheWxpc3Q/bmFtZT0ke25hbWV9YCxcclxuICAgIHBvc3RJdGVtc1RvUGxheWxpc3Q6IChwbGF5bGlzdElkOiBzdHJpbmcpID0+IGAvc3BvdGlmeS9wb3N0LWl0ZW1zLXRvLXBsYXlsaXN0P3BsYXlsaXN0X2lkPSR7cGxheWxpc3RJZH1gLFxyXG4gICAgZ2V0VXNlcm5hbWU6ICcvdXNlci9nZXQtdXNlcm5hbWUnXHJcbiAgfSxcclxuICBQQVRIUzoge1xyXG4gICAgc3Bpbm5lcjogJy9pbWFnZXMvMjAwcHhMb2FkaW5nU3Bpbm5lci5zdmcnLFxyXG4gICAgYWNvdXN0aWNFbW9qaTogJy9pbWFnZXMvRW1vamlzL0Fjb3VzdGljRW1vamkuc3ZnJyxcclxuICAgIG5vbkFjb3VzdGljRW1vamk6ICcvaW1hZ2VzL0Vtb2ppcy9FbGVjdHJpY0d1aXRhckVtb2ppLnN2ZycsXHJcbiAgICBoYXBweUVtb2ppOiAnL2ltYWdlcy9FbW9qaXMvSGFwcHlFbW9qaS5zdmcnLFxyXG4gICAgbmV1dHJhbEVtb2ppOiAnL2ltYWdlcy9FbW9qaXMvTmV1dHJhbEVtb2ppLnN2ZycsXHJcbiAgICBzYWRFbW9qaTogJy9pbWFnZXMvRW1vamlzL1NhZEVtb2ppLnN2ZycsXHJcbiAgICBpbnN0cnVtZW50RW1vamk6ICcvaW1hZ2VzL0Vtb2ppcy9JbnN0cnVtZW50RW1vamkuc3ZnJyxcclxuICAgIHNpbmdlckVtb2ppOiAnL2ltYWdlcy9FbW9qaXMvU2luZ2VyRW1vamkuc3ZnJyxcclxuICAgIGRhbmNpbmdFbW9qaTogJy9pbWFnZXMvRW1vamlzL0RhbmNpbmdFbW9qaS5zdmcnLFxyXG4gICAgc2hlZXBFbW9qaTogJy9pbWFnZXMvRW1vamlzL1NoZWVwRW1vamkuc3ZnJyxcclxuICAgIHdvbGZFbW9qaTogJy9pbWFnZXMvRW1vamlzL1dvbGZFbW9qaS5zdmcnLFxyXG4gICAgZ3JpZFZpZXc6ICcvaW1hZ2VzL2dyaWQtdmlldy1pY29uLnBuZycsXHJcbiAgICBsaXN0VmlldzogJy9pbWFnZXMvbGlzdC12aWV3LWljb24ucG5nJyxcclxuICAgIGNoZXZyb25MZWZ0OiAnL2ltYWdlcy9jaGV2cm9uLWxlZnQucG5nJyxcclxuICAgIGNoZXZyb25SaWdodDogJy9pbWFnZXMvY2hldnJvbi1yaWdodC5wbmcnLFxyXG4gICAgcGxheUljb246ICcvaW1hZ2VzL3BsYXktMzBweC5wbmcnLFxyXG4gICAgcGF1c2VJY29uOiAnL2ltYWdlcy9wYXVzZS0zMHB4LnBuZycsXHJcbiAgICBwbGF5QmxhY2tJY29uOiAnL2ltYWdlcy9wbGF5LWJsYWNrLTMwcHgucG5nJyxcclxuICAgIHBhdXNlQmxhY2tJY29uOiAnL2ltYWdlcy9wYXVzZS1ibGFjay0zMHB4LnBuZycsXHJcbiAgICBwbGF5TmV4dDogJy9pbWFnZXMvbmV4dC0zMHB4LnBuZycsXHJcbiAgICBwbGF5UHJldjogJy9pbWFnZXMvcHJldmlvdXMtMzBweC5wbmcnLFxyXG4gICAgcHJvZmlsZVVzZXI6ICcvaW1hZ2VzL3Byb2ZpbGUtdXNlci5wbmcnXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyAobWlsbGlzOiBudW1iZXIpIHtcclxuICBjb25zdCBtaW51dGVzOiBudW1iZXIgPSBNYXRoLmZsb29yKG1pbGxpcyAvIDYwMDAwKVxyXG4gIGNvbnN0IHNlY29uZHM6IG51bWJlciA9IHBhcnNlSW50KCgobWlsbGlzICUgNjAwMDApIC8gMTAwMCkudG9GaXhlZCgwKSlcclxuICByZXR1cm4gc2Vjb25kcyA9PT0gNjBcclxuICAgID8gbWludXRlcyArIDEgKyAnOjAwJ1xyXG4gICAgOiBtaW51dGVzICsgJzonICsgKHNlY29uZHMgPCAxMCA/ICcwJyA6ICcnKSArIHNlY29uZHNcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gaHRtbFRvRWwgKGh0bWw6IHN0cmluZykge1xyXG4gIGNvbnN0IHRlbXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpXHJcbiAgaHRtbCA9IGh0bWwudHJpbSgpIC8vIE5ldmVyIHJldHVybiBhIHNwYWNlIHRleHQgbm9kZSBhcyBhIHJlc3VsdFxyXG4gIHRlbXAuaW5uZXJIVE1MID0gaHRtbFxyXG4gIHJldHVybiB0ZW1wLmNvbnRlbnQuZmlyc3RDaGlsZFxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJvbWlzZUhhbmRsZXI8VD4gKFxyXG4gIHByb21pc2U6IFByb21pc2U8VD4sXHJcbiAgb25TdWNjZXNmdWwgPSAocmVzOiBUKSA9PiB7IH0sXHJcbiAgb25GYWlsdXJlID0gKGVycjogdW5rbm93bikgPT4ge1xyXG4gICAgaWYgKGVycikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKGVycilcclxuICAgIH1cclxuICB9XHJcbikge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBwcm9taXNlXHJcbiAgICBvblN1Y2Nlc2Z1bChyZXMgYXMgVClcclxuICAgIHJldHVybiB7IHJlczogcmVzLCBlcnI6IG51bGwgfSBhcyBJUHJvbWlzZUhhbmRsZXJSZXR1cm48VD5cclxuICB9IGNhdGNoIChlcnI6IHVua25vd24pIHtcclxuICAgIG9uRmFpbHVyZShlcnIpXHJcbiAgICByZXR1cm4geyByZXM6IG51bGwsIGVycjogZXJyIH0gYXMgSVByb21pc2VIYW5kbGVyUmV0dXJuPFQ+XHJcbiAgfVxyXG59XHJcblxyXG4vKiogRmlsdGVycyAnbGknIGVsZW1lbnRzIHRvIGVpdGhlciBiZSBoaWRkZW4gb3Igbm90IGRlcGVuZGluZyBvbiBpZlxyXG4gKiB0aGV5IGNvbnRhaW4gc29tZSBnaXZlbiBpbnB1dCB0ZXh0LlxyXG4gKlxyXG4gKiBAcGFyYW0ge0hUTUx9IHVsIC0gdW5vcmRlcmVkIGxpc3QgZWxlbWVudCB0aGF0IGNvbnRhaW5zIHRoZSAnbGknIHRvIGJlIGZpbHRlcmVkXHJcbiAqIEBwYXJhbSB7SFRNTH0gaW5wdXQgLSBpbnB1dCBlbGVtZW50IHdob3NlIHZhbHVlIHdpbGwgYmUgdXNlZCB0byBmaWx0ZXJcclxuICogQHBhcmFtIHtTdHJpbmd9IHN0ZERpc3BsYXkgLSB0aGUgc3RhbmRhcmQgZGlzcGxheSB0aGUgJ2xpJyBzaG91bGQgaGF2ZSB3aGVuIG5vdCAnbm9uZSdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzZWFyY2hVbCAodWw6IEhUTUxVTGlzdEVsZW1lbnQsIGlucHV0OiBIVE1MSW5wdXRFbGVtZW50LCBzdGREaXNwbGF5OiBzdHJpbmcgPSAnZmxleCcpOiB2b2lkIHtcclxuICBjb25zdCBsaUVscyA9IHVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdsaScpXHJcbiAgY29uc3QgZmlsdGVyID0gaW5wdXQudmFsdWUudG9VcHBlckNhc2UoKVxyXG5cclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxpRWxzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAvLyBnZXQgdGhlIG5hbWUgY2hpbGQgZWwgaW4gdGhlIGxpIGVsXHJcbiAgICBjb25zdCBuYW1lID0gbGlFbHNbaV0uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWcuQ1NTLkNMQVNTRVMubmFtZSlbMF1cclxuICAgIGNvbnN0IG5hbWVUeHQgPSBuYW1lLnRleHRDb250ZW50IHx8IG5hbWUuaW5uZXJIVE1MXHJcblxyXG4gICAgaWYgKG5hbWVUeHQgJiYgbmFtZVR4dC50b1VwcGVyQ2FzZSgpLmluZGV4T2YoZmlsdGVyKSA+IC0xKSB7XHJcbiAgICAgIC8vIHNob3cgbGkncyB3aG9zZSBuYW1lIGNvbnRhaW5zIHRoZSB0aGUgZW50ZXJlZCBzdHJpbmdcclxuICAgICAgbGlFbHNbaV0uc3R5bGUuZGlzcGxheSA9IHN0ZERpc3BsYXlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIG90aGVyd2lzZSBoaWRlIGl0XHJcbiAgICAgIGxpRWxzW2ldLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVc2VzIGNhbnZhcy5tZWFzdXJlVGV4dCB0byBjb21wdXRlIGFuZCByZXR1cm4gdGhlIHdpZHRoIG9mIHRoZSBnaXZlbiB0ZXh0IG9mIGdpdmVuIGZvbnQgaW4gcGl4ZWxzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gdGV4dCBUaGUgdGV4dCB0byBiZSByZW5kZXJlZC5cclxuICogQHBhcmFtIHtTdHJpbmd9IGZvbnQgVGhlIGNzcyBmb250IGRlc2NyaXB0b3IgdGhhdCB0ZXh0IGlzIHRvIGJlIHJlbmRlcmVkIHdpdGggKGUuZy4gXCJib2xkIDE0cHggdmVyZGFuYVwiKS5cclxuICpcclxuICogQHNlZSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMTgyNDEvY2FsY3VsYXRlLXRleHQtd2lkdGgtd2l0aC1qYXZhc2NyaXB0LzIxMDE1MzkzIzIxMDE1MzkzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGV4dFdpZHRoICh0ZXh0OiBzdHJpbmcsIGZvbnQ6IHN0cmluZykge1xyXG4gIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXHJcbiAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXHJcbiAgbGV0IG1ldHJpY3M6IFRleHRNZXRyaWNzXHJcbiAgaWYgKGNvbnRleHQpIHtcclxuICAgIGNvbnRleHQuZm9udCA9IGZvbnRcclxuICAgIG1ldHJpY3MgPSBjb250ZXh0Lm1lYXN1cmVUZXh0KHRleHQpXHJcbiAgICByZXR1cm4gbWV0cmljcy53aWR0aFxyXG4gIH1cclxuXHJcbiAgdGhyb3cgbmV3IEVycm9yKCdObyBjb250ZXh0IG9uIGNyZWF0ZWQgY2FudmFzIHdhcyBmb3VuZCcpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0VsbGlwc2lzQWN0aXZlIChlbDogSFRNTEVsZW1lbnQpIHtcclxuICByZXR1cm4gZWwub2Zmc2V0V2lkdGggPCBlbC5zY3JvbGxXaWR0aFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2FwaXRhbGl6ZUZpcnN0TGV0dGVyIChzdHJpbmc6IHN0cmluZykge1xyXG4gIHJldHVybiBzdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHJpbmcuc2xpY2UoMSlcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFZhbGlkSW1hZ2UgKGltYWdlczogQXJyYXk8U3BvdGlmeUltZz4sIGlkeCA9IDApIHtcclxuICAvLyBvYnRhaW4gdGhlIGNvcnJlY3QgaW1hZ2VcclxuICBpZiAoaW1hZ2VzLmxlbmd0aCA+IGlkeCkge1xyXG4gICAgY29uc3QgaW1nID0gaW1hZ2VzW2lkeF1cclxuICAgIHJldHVybiBpbWcudXJsXHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiAnJ1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUFsbENoaWxkTm9kZXMgKHBhcmVudDogTm9kZSkge1xyXG4gIHdoaWxlIChwYXJlbnQuZmlyc3RDaGlsZCkge1xyXG4gICAgcGFyZW50LnJlbW92ZUNoaWxkKHBhcmVudC5maXJzdENoaWxkKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGFuaW1hdGlvbkNvbnRyb2wgPSAoZnVuY3Rpb24gKCkge1xyXG4gIC8qKiBBZGRzIGEgY2xhc3MgdG8gZWFjaCBlbGVtZW50IGNhdXNpbmcgYSB0cmFuc2l0aW9uIHRvIHRoZSBjaGFuZ2VkIGNzcyB2YWx1ZXMuXHJcbiAgICogVGhpcyBpcyBkb25lIG9uIHNldCBpbnRlcnZhbHMuXHJcbiAgICpcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBlbGVtZW50c1RvQW5pbWF0ZSAtIGNvbW1hIHNlcGFyYXRlZCBzdHJpbmcgY29udGFpbmluZyB0aGUgY2xhc3NlcyBvciBpZHMgb2YgZWxlbWVudHMgdG8gYW5pbWF0ZSBpbmNsdWRpbmcgcHJlZml4IGNoYXIuXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGNsYXNzVG9UcmFuc2l0aW9uVG9vIC0gVGhlIGNsYXNzIHRoYXQgYWxsIHRoZSB0cmFuc2l0aW9uaW5nIGVsZW1lbnRzIHdpbGwgYWRkXHJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGFuaW1hdGlvbkludGVydmFsIC0gVGhlIGludGVydmFsIHRvIHdhaXQgYmV0d2VlbiBhbmltYXRpb24gb2YgZWxlbWVudHNcclxuICAgKi9cclxuICBmdW5jdGlvbiBpbnRlcnZhbEVsZW1lbnRzVHJhbnNpdGlvbnMgKFxyXG4gICAgZWxlbWVudHNUb0FuaW1hdGU6IHN0cmluZyxcclxuICAgIGNsYXNzVG9UcmFuc2l0aW9uVG9vOiBzdHJpbmcsXHJcbiAgICBhbmltYXRpb25JbnRlcnZhbDogbnVtYmVyXHJcbiAgKSB7XHJcbiAgICAvLyBhcnIgb2YgaHRtbCBzZWxlY3RvcnMgdGhhdCBwb2ludCB0byBlbGVtZW50cyB0byBhbmltYXRlXHJcbiAgICBjb25zdCBhdHRyaWJ1dGVzID0gZWxlbWVudHNUb0FuaW1hdGUuc3BsaXQoJywnKVxyXG5cclxuICAgIGF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cikgPT4ge1xyXG4gICAgICBjb25zdCBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYXR0cilcclxuICAgICAgbGV0IGlkeCA9IDBcclxuICAgICAgLy8gaW4gaW50ZXJ2YWxzIHBsYXkgdGhlaXIgaW5pdGlhbCBhbmltYXRpb25zXHJcbiAgICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgIGlmIChpZHggPT09IGVsZW1lbnRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbClcclxuICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gZWxlbWVudHNbaWR4XVxyXG4gICAgICAgIC8vIGFkZCB0aGUgY2xhc3MgdG8gdGhlIGVsZW1lbnRzIGNsYXNzZXMgaW4gb3JkZXIgdG8gcnVuIHRoZSB0cmFuc2l0aW9uXHJcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzVG9UcmFuc2l0aW9uVG9vKVxyXG4gICAgICAgIGlkeCArPSAxXHJcbiAgICAgIH0sIGFuaW1hdGlvbkludGVydmFsKVxyXG4gICAgfSlcclxuICB9XHJcbiAgLyoqIEFuaW1hdGVzIGFsbCBlbGVtZW50cyB0aGF0IGNvbnRhaW4gYSBjZXJ0YWluIGNsYXNzIG9yIGlkXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gZWxlbWVudHNUb0FuaW1hdGUgLSBjb21tYSBzZXBhcmF0ZWQgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIGNsYXNzZXMgb3IgaWRzIG9mIGVsZW1lbnRzIHRvIGFuaW1hdGUgSU5DTFVESU5HIHByZWZpeCBjaGFyLlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjbGFzc1RvQWRkIC0gY2xhc3MgdG8gYWRkIEVYQ0xVRElORyB0aGUgcHJlZml4IGNoYXIuXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFuaW1hdGlvbkludGVydmFsIC0gdGhlIGludGVydmFsIHRvIGFuaW1hdGUgdGhlIGdpdmVuIGVsZW1lbnRzIGluIG1pbGxpc2Vjb25kcy5cclxuICAgKi9cclxuICBmdW5jdGlvbiBhbmltYXRlQXR0cmlidXRlcyAoZWxlbWVudHNUb0FuaW1hdGU6IHN0cmluZywgY2xhc3NUb0FkZDogc3RyaW5nLCBhbmltYXRpb25JbnRlcnZhbDogbnVtYmVyKSB7XHJcbiAgICBpbnRlcnZhbEVsZW1lbnRzVHJhbnNpdGlvbnMoXHJcbiAgICAgIGVsZW1lbnRzVG9BbmltYXRlLFxyXG4gICAgICBjbGFzc1RvQWRkLFxyXG4gICAgICBhbmltYXRpb25JbnRlcnZhbFxyXG4gICAgKVxyXG4gIH1cclxuICByZXR1cm4ge1xyXG4gICAgYW5pbWF0ZUF0dHJpYnV0ZXNcclxuICB9XHJcbn0pKClcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQaXhlbFBvc0luRWxPbkNsaWNrIChtb3VzZUV2dDogTW91c2VFdmVudCk6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB7XHJcbiAgY29uc3QgcmVjdCA9IChtb3VzZUV2dC50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXHJcbiAgY29uc3QgeCA9IG1vdXNlRXZ0LmNsaWVudFggLSByZWN0LmxlZnQgLy8geCBwb3NpdGlvbiB3aXRoaW4gdGhlIGVsZW1lbnQuXHJcbiAgY29uc3QgeSA9IG1vdXNlRXZ0LmNsaWVudFkgLSByZWN0LnRvcCAvLyB5IHBvc2l0aW9uIHdpdGhpbiB0aGUgZWxlbWVudC5cclxuICByZXR1cm4geyB4LCB5IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRocm93RXhwcmVzc2lvbiAoZXJyb3JNZXNzYWdlOiBzdHJpbmcpOiBuZXZlciB7XHJcbiAgdGhyb3cgbmV3IEVycm9yKGVycm9yTWVzc2FnZSlcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZEl0ZW1zVG9QbGF5bGlzdCAocGxheWxpc3RJZDogc3RyaW5nLCB1cmlzOiBBcnJheTxzdHJpbmc+KSB7XHJcbiAgYXdhaXQgcHJvbWlzZUhhbmRsZXIoXHJcbiAgICBheGlvcyh7XHJcbiAgICAgIG1ldGhvZDogJ3Bvc3QnLFxyXG4gICAgICB1cmw6IGNvbmZpZy5VUkxzLnBvc3RJdGVtc1RvUGxheWxpc3QocGxheWxpc3RJZCksXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICB1cmlzOiB1cmlzXHJcbiAgICAgIH1cclxuICAgIH0pLFxyXG4gICAgKCkgPT4ge30sICgpID0+IHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJc3N1ZSBhZGRpbmcgaXRlbXMgdG8gcGxheWxpc3QnKVxyXG4gICAgfSlcclxufVxyXG4iLCJpbXBvcnQgeyBjb25maWcsIHByb21pc2VIYW5kbGVyIH0gZnJvbSAnLi9jb25maWcnXHJcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcydcclxuaW1wb3J0IHsgZGlzcGxheVVzZXJuYW1lIH0gZnJvbSAnLi91c2VyLWRhdGEnXHJcblxyXG5jb25zdCBIQUxGX0hPVVIgPSAxLjhlNiAvKiAzMCBtaW4gaW4gbXMgKi9cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGVja0lmSGFzVG9rZW5zICgpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAvLyBpZiB0aGUgdXNlciBzdGF5cyBvbiB0aGUgc2FtZSBwYWdlIGZvciAzMCBtaW4gcmVmcmVzaCB0aGUgdG9rZW4uXHJcbiAgY29uc3Qgc3RhcnRSZWZyZXNoSW50ZXJ2YWwgPSAoKSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygnc3RhcnQgaW50ZXJ2YWwgcmVmcmVzaCcpXHJcbiAgICBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgIHByb21pc2VIYW5kbGVyKGF4aW9zLnB1dChjb25maWcuVVJMcy5wdXRSZWZyZXNoQWNjZXNzVG9rZW4pKVxyXG4gICAgICBjb25zb2xlLmxvZygncmVmcmVzaCBhc3luYycpXHJcbiAgICB9LCBIQUxGX0hPVVIpXHJcbiAgfVxyXG4gIGxldCBoYXNUb2tlbiA9IGZhbHNlXHJcbiAgLy8gYXdhaXQgcHJvbWlzZSByZXNvbHZlIHRoYXQgcmV0dXJucyB3aGV0aGVyIHRoZSBzZXNzaW9uIGhhcyB0b2tlbnMuXHJcbiAgYXdhaXQgcHJvbWlzZUhhbmRsZXIoXHJcbiAgICBheGlvcy5nZXQoY29uZmlnLlVSTHMuZ2V0SGFzVG9rZW5zKSxcclxuICAgIChyZXMpID0+IHtcclxuICAgICAgaGFzVG9rZW4gPSByZXMuZGF0YVxyXG4gICAgfVxyXG4gIClcclxuXHJcbiAgaWYgKGhhc1Rva2VuKSB7XHJcbiAgICBzdGFydFJlZnJlc2hJbnRlcnZhbCgpXHJcbiAgfVxyXG4gIHJldHVybiBoYXNUb2tlblxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VG9rZW5zIChvbk5vVG9rZW46ICgpID0+IHZvaWQpIHtcclxuICBsZXQgaGFzVG9rZW4gPSBmYWxzZVxyXG4gIC8vIGNyZWF0ZSBhIHBhcmFtZXRlciBzZWFyY2hlciBpbiB0aGUgVVJMIGFmdGVyICc/JyB3aGljaCBob2xkcyB0aGUgcmVxdWVzdHMgYm9keSBwYXJhbWV0ZXJzXHJcbiAgY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKVxyXG5cclxuICAvLyBHZXQgdGhlIGNvZGUgZnJvbSB0aGUgcGFyYW1ldGVyIGNhbGxlZCAnY29kZScgaW4gdGhlIHVybCB3aGljaFxyXG4gIC8vIGhvcGVmdWxseSBjYW1lIGJhY2sgZnJvbSB0aGUgc3BvdGlmeSBHRVQgcmVxdWVzdCBvdGhlcndpc2UgaXQgaXMgbnVsbFxyXG4gIGxldCBhdXRoQ29kZSA9IHVybFBhcmFtcy5nZXQoJ2NvZGUnKVxyXG5cclxuICBpZiAoYXV0aENvZGUpIHtcclxuICAgIC8vIG9idGFpbiB0b2tlbnNcclxuICAgIGF3YWl0IHByb21pc2VIYW5kbGVyKFxyXG4gICAgICBheGlvcy5nZXQoY29uZmlnLlVSTHMuZ2V0T2J0YWluVG9rZW5zUHJlZml4KGF1dGhDb2RlKSksXHJcblxyXG4gICAgICAvLyBpZiB0aGUgcmVxdWVzdCB3YXMgc3VjY2VzZnVsIHdlIGhhdmUgcmVjaWV2ZWQgYSB0b2tlblxyXG4gICAgICAoKSA9PiAoaGFzVG9rZW4gPSB0cnVlKVxyXG4gICAgKVxyXG4gICAgYXV0aENvZGUgPSAnJ1xyXG5cclxuICAgIC8vIGdldCB1c2VyIGluZm8gZnJvbSBzcG90aWZ5XHJcbiAgICBhd2FpdCBwcm9taXNlSGFuZGxlcihheGlvcy5nZXQoY29uZmlnLlVSTHMuZ2V0Q3VycmVudFVzZXJQcm9maWxlKSlcclxuICB9IGVsc2Uge1xyXG4gICAgb25Ob1Rva2VuKClcclxuICB9XHJcblxyXG4gIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZShudWxsLCAnJywgJy8nKVxyXG4gIHJldHVybiBoYXNUb2tlblxyXG59XHJcblxyXG4vKiogR2VuZXJhdGUgYSBsb2dpbi9jaGFuZ2UgYWNjb3VudCBsaW5rLiBEZWZhdWx0cyB0byBhcHBlbmRpbmcgaXQgb250byB0aGUgbmF2IGJhci5cclxuICpcclxuICogQHBhcmFtIHtBcnJheTxTdHJpbmc+fSBjbGFzc2VzVG9BZGQgLSB0aGUgY2xhc3NlcyB0byBhZGQgb250byB0aGUgbGluay5cclxuICogQHBhcmFtIHtCb29sZWFufSBjaGFuZ2VBY2NvdW50IC0gV2hldGhlciB0aGUgbGluayBzaG91bGQgYmUgZm9yIGNoYW5naW5nIGFjY291bnQsIG9yIGZvciBsb2dnaW5nIGluLiAoZGVmYXVsdHMgdG8gdHJ1ZSlcclxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyZW50RWwgLSB0aGUgcGFyZW50IGVsZW1lbnQgdG8gYXBwZW5kIHRoZSBsaW5rIG9udG8uIChkZWZhdWx0cyB0byBuYXZiYXIpXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVMb2dpbiAoe1xyXG4gIGNsYXNzZXNUb0FkZCA9IFsncmlnaHQnXSxcclxuICBjaGFuZ2VBY2NvdW50ID0gdHJ1ZSxcclxuICBwYXJlbnRFbCA9IGRvY3VtZW50XHJcbiAgICAuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgndG9wbmF2JylbMF1cclxuICAgIC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdyaWdodCcpWzBdXHJcbiAgICAuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZHJvcGRvd24tY29udGVudCcpWzBdXHJcbn0gPSB7fSkge1xyXG4gIC8vIENyZWF0ZSBhbmNob3IgZWxlbWVudC5cclxuICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXHJcbiAgYS5ocmVmID0gY29uZmlnLlVSTHMuYXV0aFxyXG5cclxuICAvLyBDcmVhdGUgdGhlIHRleHQgbm9kZSBmb3IgYW5jaG9yIGVsZW1lbnQuXHJcbiAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFxyXG4gICAgY2hhbmdlQWNjb3VudCA/ICdDaGFuZ2UgQWNjb3VudCcgOiAnTG9naW4gVG8gU3BvdGlmeSdcclxuICApXHJcblxyXG4gIC8vIEFwcGVuZCB0aGUgdGV4dCBub2RlIHRvIGFuY2hvciBlbGVtZW50LlxyXG4gIGEuYXBwZW5kQ2hpbGQobGluaylcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGNsYXNzZXNUb0FkZC5sZW5ndGg7IGkrKykge1xyXG4gICAgY29uc3QgY2xhc3NUb0FkZCA9IGNsYXNzZXNUb0FkZFtpXVxyXG4gICAgYS5jbGFzc0xpc3QuYWRkKGNsYXNzVG9BZGQpXHJcbiAgfVxyXG5cclxuICAvLyBjbGVhciBjdXJyZW50IHRva2VucyB3aGVuIGNsaWNrZWRcclxuICBhLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgYXhpb3MucHV0KGNvbmZpZy5VUkxzLnB1dENsZWFyVG9rZW5zKS5jYXRjaCgoZXJyKSA9PiBjb25zb2xlLmVycm9yKGVycikpXHJcbiAgfSlcclxuXHJcbiAgLy8gQXBwZW5kIHRoZSBhbmNob3IgZWxlbWVudCB0byB0aGUgcGFyZW50LlxyXG4gIHBhcmVudEVsLmFwcGVuZENoaWxkKGEpXHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIG9uU3VjY2Vzc2Z1bFRva2VuQ2FsbCAoXHJcbiAgaGFzVG9rZW46IGJvb2xlYW4sXHJcbiAgaGFzVG9rZW5DYWxsYmFjayA9ICgpID0+IHsgfSxcclxuICBub1Rva2VuQ2FsbEJhY2sgPSAoKSA9PiB7IH1cclxuKSB7XHJcbiAgY29uc3QgZ2V0VG9rZW5zU3Bpbm5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxyXG4gICAgY29uZmlnLkNTUy5JRHMuZ2V0VG9rZW5Mb2FkaW5nU3Bpbm5lclxyXG4gIClcclxuXHJcbiAgLy8gcmVtb3ZlIHRva2VuIHNwaW5uZXIgYmVjYXVzZSBieSB0aGlzIGxpbmUgd2UgaGF2ZSBvYnRhaW5lZCB0aGUgdG9rZW5cclxuICBnZXRUb2tlbnNTcGlubmVyPy5wYXJlbnROb2RlPy5yZW1vdmVDaGlsZChnZXRUb2tlbnNTcGlubmVyKVxyXG5cclxuICBjb25zdCBpbmZvQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMuaW5mb0NvbnRhaW5lcilcclxuICBpZiAoaGFzVG9rZW4pIHtcclxuICAgIC8vIGdlbmVyYXRlIHRoZSBuYXYgbG9naW5cclxuICAgIGdlbmVyYXRlTG9naW4oKVxyXG4gICAgaWYgKGluZm9Db250YWluZXIgPT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0luZm8gY29udGFpbmVyIEVsZW1lbnQgZG9lcyBub3QgZXhpc3QnKVxyXG4gICAgfVxyXG4gICAgaW5mb0NvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xyXG4gICAgZGlzcGxheVVzZXJuYW1lKClcclxuICAgIGhhc1Rva2VuQ2FsbGJhY2soKVxyXG4gIH0gZWxzZSB7XHJcbiAgICAvLyBpZiB0aGVyZSBpcyBubyB0b2tlbiByZWRpcmVjdCB0byBhbGxvdyBhY2Nlc3MgcGFnZVxyXG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBjb25maWcuVVJMcy5zaXRlVXJsXHJcbiAgICBub1Rva2VuQ2FsbEJhY2soKVxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgQXJ0aXN0LCB7IGdlbmVyYXRlQXJ0aXN0c0Zyb21EYXRhIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hcnRpc3QnXHJcbmltcG9ydCB7XHJcbiAgY29uZmlnLFxyXG4gIHByb21pc2VIYW5kbGVyLFxyXG4gIGh0bWxUb0VsLFxyXG4gIHJlbW92ZUFsbENoaWxkTm9kZXMsXHJcbiAgYW5pbWF0aW9uQ29udHJvbCxcclxuICB0aHJvd0V4cHJlc3Npb25cclxufSBmcm9tICcuLi8uLi9jb25maWcnXHJcbmltcG9ydCBTZWxlY3RhYmxlVGFiRWxzIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvU2VsZWN0YWJsZVRhYkVscydcclxuaW1wb3J0IHtcclxuICBjaGVja0lmSGFzVG9rZW5zLFxyXG4gIG9uU3VjY2Vzc2Z1bFRva2VuQ2FsbFxyXG59IGZyb20gJy4uLy4uL21hbmFnZS10b2tlbnMnXHJcbmltcG9ydCBBc3luY1NlbGVjdGlvblZlcmlmIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXN5bmNTZWxlY3Rpb25WZXJpZidcclxuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJ1xyXG5pbXBvcnQgeyBkZXRlcm1pbmVUZXJtLCBsb2FkVGVybSwgc2F2ZVRlcm0sIHNlbGVjdFN0YXJ0VGVybVRhYiwgVEVSTVMsIFRFUk1fVFlQRSB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvc2F2ZS1sb2FkLXRlcm0nXHJcblxyXG5jb25zdCBNQVhfVklFV0FCTEVfQ0FSRFMgPSA1XHJcblxyXG5jb25zdCBhcnRpc3RBY3Rpb25zID0gKGZ1bmN0aW9uICgpIHtcclxuICBjb25zdCBzZWxlY3Rpb25zID0ge1xyXG4gICAgbnVtVmlld2FibGVDYXJkczogTUFYX1ZJRVdBQkxFX0NBUkRTLFxyXG4gICAgdGVybTogVEVSTVMuU0hPUlRfVEVSTVxyXG4gIH1cclxuICBmdW5jdGlvbiBsb2FkQXJ0aXN0VG9wVHJhY2tzIChhcnRpc3RPYmo6IEFydGlzdCwgY2FsbGJhY2s6IEZ1bmN0aW9uKSB7XHJcbiAgICBhcnRpc3RPYmpcclxuICAgICAgLmxvYWRUb3BUcmFja3MoKVxyXG4gICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgY2FsbGJhY2soKVxyXG4gICAgICB9KVxyXG4gICAgICAuY2F0Y2goKGVycjogdW5rbm93bikgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdFcnJvciB3aGVuIGxvYWRpbmcgYXJ0aXN0cycpXHJcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnIpXHJcbiAgICAgIH0pXHJcbiAgfVxyXG4gIGZ1bmN0aW9uIHNob3dUb3BUcmFja3MgKGFydGlzdE9iajogQXJ0aXN0KSB7XHJcbiAgICBsb2FkQXJ0aXN0VG9wVHJhY2tzKGFydGlzdE9iaiwgKCkgPT4ge1xyXG4gICAgICBjb25zdCB0cmFja0xpc3QgPSBnZXRUb3BUcmFja3NVbEZyb21BcnRpc3QoYXJ0aXN0T2JqKVxyXG4gICAgICBsZXQgcmFuayA9IDFcclxuICAgICAgaWYgKGFydGlzdE9iai50b3BUcmFja3MgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHRocm93RXhwcmVzc2lvbignYXJ0aXN0IGRvZXMgbm90IGhhdmUgdG9wIHRyYWNrcyBsb2FkZWQgb24gcmVxdWVzdCB0byBzaG93IHRoZW0nKVxyXG4gICAgICB9XHJcbiAgICAgIGZvciAoY29uc3QgdHJhY2sgb2YgYXJ0aXN0T2JqLnRvcFRyYWNrcy52YWx1ZXMoKSkge1xyXG4gICAgICAgIHRyYWNrTGlzdC5hcHBlbmRDaGlsZCh0cmFjay5nZXRSYW5rZWRUcmFja0h0bWwoYXJ0aXN0T2JqLnRvcFRyYWNrcywgcmFuaykpXHJcbiAgICAgICAgcmFuaysrXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRUb3BUcmFja3NVbEZyb21BcnRpc3QgKGFydGlzdE9iajogQXJ0aXN0KSB7XHJcbiAgICBjb25zdCBhcnRpc3RDYXJkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYXJ0aXN0T2JqLmNhcmRJZCkgPz8gdGhyb3dFeHByZXNzaW9uKCdhcnRpc3QgY2FyZCBkb2VzIG5vdCBleGlzdCcpXHJcbiAgICBjb25zdCB0cmFja0xpc3QgPSBhcnRpc3RDYXJkLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY29uZmlnLkNTUy5DTEFTU0VTLnRyYWNrTGlzdClbMF1cclxuXHJcbiAgICBpZiAodHJhY2tMaXN0ID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93RXhwcmVzc2lvbihgdHJhY2sgdWwgb24gYXJ0aXN0IGVsZW1lbnQgd2l0aCBpZCAke2FydGlzdE9iai5jYXJkSWR9IGRvZXMgbm90IGV4aXN0YClcclxuICAgIH1cclxuICAgIHJldHVybiB0cmFja0xpc3RcclxuICB9XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIHJldHJpZXZlQXJ0aXN0cyAoYXJ0aXN0QXJyOiBBcnJheTxBcnRpc3Q+KSB7XHJcbiAgICBjb25zdCB7IHJlcywgZXJyIH0gPSBhd2FpdCBwcm9taXNlSGFuZGxlcihcclxuICAgICAgYXhpb3MuZ2V0KGNvbmZpZy5VUkxzLmdldFRvcEFydGlzdHMgKyBzZWxlY3Rpb25zLnRlcm0pXHJcbiAgICApXHJcbiAgICBpZiAoZXJyKSB7XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgLy8gd2Uga25vdyByZXMgaXMgbm90IG51bGwgYmVjYXVzZSBpdCBpcyBvbmx5IG51bGwgaWYgYW4gZXJyb3IgZXhpc3RzIGluIHdoaWNoIHdlIGhhdmUgYWxyZWFkeSByZXR1cm5lZFxyXG4gICAgZ2VuZXJhdGVBcnRpc3RzRnJvbURhdGEocmVzIS5kYXRhLCBhcnRpc3RBcnIpXHJcbiAgfVxyXG4gIGZ1bmN0aW9uIGdldEN1cnJTZWxUb3BBcnRpc3RzICgpIHtcclxuICAgIGlmIChzZWxlY3Rpb25zLnRlcm0gPT09IFRFUk1TLlNIT1JUX1RFUk0pIHtcclxuICAgICAgcmV0dXJuIGFydGlzdEFycnMudG9wQXJ0aXN0T2Jqc1Nob3J0VGVybVxyXG4gICAgfSBlbHNlIGlmIChzZWxlY3Rpb25zLnRlcm0gPT09IFRFUk1TLk1JRF9URVJNKSB7XHJcbiAgICAgIHJldHVybiBhcnRpc3RBcnJzLnRvcEFydGlzdE9ianNNaWRUZXJtXHJcbiAgICB9IGVsc2UgaWYgKHNlbGVjdGlvbnMudGVybSA9PT0gVEVSTVMuTE9OR19URVJNKSB7XHJcbiAgICAgIHJldHVybiBhcnRpc3RBcnJzLnRvcEFydGlzdE9ianNMb25nVGVybVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZWxlY3RlZCB0cmFjayB0ZXJtIGlzIGludmFsaWQgJyArIHNlbGVjdGlvbnMudGVybSlcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHtcclxuICAgIHNob3dUb3BUcmFja3MsXHJcbiAgICByZXRyaWV2ZUFydGlzdHMsXHJcbiAgICBzZWxlY3Rpb25zLFxyXG4gICAgZ2V0Q3VyclNlbFRvcEFydGlzdHNcclxuICB9XHJcbn0pKClcclxuXHJcbmNvbnN0IGFydGlzdENhcmRzSGFuZGxlciA9IChmdW5jdGlvbiAoKSB7XHJcbiAgY29uc3Qgc2VsZWN0aW9uVmVyaWYgPSBuZXcgQXN5bmNTZWxlY3Rpb25WZXJpZjxBcnJheTxBcnRpc3Q+PigpXHJcbiAgY29uc3QgYXJ0aXN0Q29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXHJcbiAgICBjb25maWcuQ1NTLklEcy5hcnRpc3RDYXJkc0NvbnRhaW5lclxyXG4gICkgPz8gdGhyb3dFeHByZXNzaW9uKGBhcnRpc3QgY29udGFpbmVyIG9mIGlkICR7Y29uZmlnLkNTUy5JRHMuYXJ0aXN0Q2FyZHNDb250YWluZXJ9IGRvZXMgbm90IGV4aXN0YClcclxuXHJcbiAgLyoqXHJcbiAgICogR2VuZXJhdGVzIHRoZSBjYXJkcyB0byB0aGUgRE9NIHRoZW4gbWFrZXMgdGhlbSB2aXNpYmxlXHJcbiAgICogQHBhcmFtIHtBcnJheTxBcnRpc3Q+fSBhcnRpc3RBcnIgYXJyYXkgb2YgdHJhY2sgb2JqZWN0cyB3aG9zZSBjYXJkcyBzaG91bGQgYmUgZ2VuZXJhdGVkLlxyXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gYXV0b0FwcGVhciB3aGV0aGVyIHRvIHNob3cgdGhlIGNhcmQgd2l0aG91dCBhbmltYXRpb24gb3Igd2l0aCBhbmltYXRpb24uXHJcbiAgICogQHJldHVybnMge0FycmF5PEhUTUxFbGVtZW50Pn0gYXJyYXkgb2YgdGhlIGNhcmQgZWxlbWVudHMuXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gZ2VuZXJhdGVDYXJkcyAoYXJ0aXN0QXJyOiBBcnJheTxBcnRpc3Q+LCBhdXRvQXBwZWFyOiBCb29sZWFuKSB7XHJcbiAgICByZW1vdmVBbGxDaGlsZE5vZGVzKGFydGlzdENvbnRhaW5lcilcclxuICAgIC8vIGZpbGwgYXJyIG9mIGNhcmQgZWxlbWVudHMgYW5kIGFwcGVuZCB0aGVtIHRvIERPTVxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnRpc3RBcnIubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKGkgPCBhcnRpc3RBY3Rpb25zLnNlbGVjdGlvbnMubnVtVmlld2FibGVDYXJkcykge1xyXG4gICAgICAgIGNvbnN0IGFydGlzdE9iaiA9IGFydGlzdEFycltpXVxyXG4gICAgICAgIGNvbnN0IGNhcmRIdG1sID0gYXJ0aXN0T2JqLmdldEFydGlzdEh0bWwoaSlcclxuXHJcbiAgICAgICAgYXJ0aXN0Q29udGFpbmVyLmFwcGVuZENoaWxkKGNhcmRIdG1sKVxyXG5cclxuICAgICAgICBhcnRpc3RBY3Rpb25zLnNob3dUb3BUcmFja3MoYXJ0aXN0T2JqKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGJyZWFrXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmICghYXV0b0FwcGVhcikge1xyXG4gICAgICBhbmltYXRpb25Db250cm9sLmFuaW1hdGVBdHRyaWJ1dGVzKFxyXG4gICAgICAgICcuJyArIGNvbmZpZy5DU1MuQ0xBU1NFUy5hcnRpc3QsXHJcbiAgICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLmFwcGVhcixcclxuICAgICAgICAyNVxyXG4gICAgICApXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBCZWdpbnMgcmV0cmlldmluZyBhcnRpc3RzIHRoZW4gd2hlbiBkb25lIHZlcmlmaWVzIGl0IGlzIHRoZSBjb3JyZWN0IHNlbGVjdGVkIGFydGlzdC5cclxuICAgKiBAcGFyYW0ge0FycmF5PEFydGlzdD59IGFydGlzdEFyciBhcnJheSB0byBsb2FkIGFydGlzdHMgaW50by5cclxuICAgKi9cclxuICBmdW5jdGlvbiBzdGFydExvYWRpbmdBcnRpc3RzIChhcnRpc3RBcnI6IEFycmF5PEFydGlzdD4pIHtcclxuICAgIC8vIGluaXRpYWxseSBzaG93IHRoZSBsb2FkaW5nIHNwaW5uZXJcclxuICAgIGNvbnN0IGh0bWxTdHJpbmcgPSBgXHJcbiAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgPGltZyBzcmM9XCIke2NvbmZpZy5QQVRIUy5zcGlubmVyfVwiIGFsdD1cIkxvYWRpbmcuLi5cIiAvPlxyXG4gICAgICAgICAgICA8L2Rpdj5gXHJcbiAgICBjb25zdCBzcGlubmVyRWwgPSBodG1sVG9FbChodG1sU3RyaW5nKVxyXG5cclxuICAgIHJlbW92ZUFsbENoaWxkTm9kZXMoYXJ0aXN0Q29udGFpbmVyKVxyXG4gICAgYXJ0aXN0Q29udGFpbmVyLmFwcGVuZENoaWxkKHNwaW5uZXJFbCBhcyBOb2RlKVxyXG5cclxuICAgIGFydGlzdEFjdGlvbnMucmV0cmlldmVBcnRpc3RzKGFydGlzdEFycikudGhlbigoKSA9PiB7XHJcbiAgICAgIC8vIGFmdGVyIHJldHJpZXZpbmcgYXN5bmMgdmVyaWZ5IGlmIGl0IGlzIHRoZSBzYW1lIGFyciBvZiBBcnRpc3QncyBhcyB3aGF0IHdhcyBzZWxlY3RlZFxyXG4gICAgICBpZiAoIXNlbGVjdGlvblZlcmlmLmlzVmFsaWQoYXJ0aXN0QXJyKSkge1xyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBnZW5lcmF0ZUNhcmRzKGFydGlzdEFyciwgZmFsc2UpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgLyoqIExvYWQgYXJ0aXN0IG9iamVjdHMgaWYgbm90IGxvYWRlZCwgdGhlbiBnZW5lcmF0ZSBjYXJkcyB3aXRoIHRoZSBvYmplY3RzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheTxBcnRpc3Q+fSBhcnRpc3RBcnIgLSBMaXN0IG9mIHRyYWNrIG9iamVjdHMgd2hvc2UgY2FyZHMgc2hvdWxkIGJlIGdlbmVyYXRlZCBvclxyXG4gICAqIGVtcHR5IGxpc3QgdGhhdCBzaG91bGQgYmUgZmlsbGVkIHdoZW4gbG9hZGluZyB0cmFja3MuXHJcbiAgICogQHBhcmFtIHtCb29sZWFufSBhdXRvQXBwZWFyIHdoZXRoZXIgdG8gc2hvdyB0aGUgY2FyZHMgd2l0aG91dCBhbmltYXRpb24uXHJcbiAgICogQHJldHVybnMge0FycmF5PEhUTUxFbGVtZW50Pn0gbGlzdCBvZiBDYXJkIEhUTUxFbGVtZW50J3MuXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gZGlzcGxheUFydGlzdENhcmRzIChhcnRpc3RBcnI6IEFycmF5PEFydGlzdD4sIGF1dG9BcHBlYXIgPSBmYWxzZSkge1xyXG4gICAgc2VsZWN0aW9uVmVyaWYuc2VsZWN0aW9uQ2hhbmdlZChhcnRpc3RBcnIpXHJcbiAgICBpZiAoYXJ0aXN0QXJyLmxlbmd0aCA+IDApIHtcclxuICAgICAgZ2VuZXJhdGVDYXJkcyhhcnRpc3RBcnIsIGF1dG9BcHBlYXIpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzdGFydExvYWRpbmdBcnRpc3RzKGFydGlzdEFycilcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBkaXNwbGF5QXJ0aXN0Q2FyZHNcclxuICB9XHJcbn0pKClcclxuXHJcbmNvbnN0IGFydGlzdEFycnMgPSAoZnVuY3Rpb24gKCkge1xyXG4gIGNvbnN0IHRvcEFydGlzdE9ianNTaG9ydFRlcm06IEFycmF5PEFydGlzdD4gPSBbXVxyXG4gIGNvbnN0IHRvcEFydGlzdE9ianNNaWRUZXJtOiBBcnJheTxBcnRpc3Q+ID0gW11cclxuICBjb25zdCB0b3BBcnRpc3RPYmpzTG9uZ1Rlcm06IEFycmF5PEFydGlzdD4gPSBbXVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgdG9wQXJ0aXN0T2Jqc1Nob3J0VGVybSxcclxuICAgIHRvcEFydGlzdE9ianNNaWRUZXJtLFxyXG4gICAgdG9wQXJ0aXN0T2Jqc0xvbmdUZXJtXHJcbiAgfVxyXG59KSgpXHJcblxyXG5jb25zdCBhcnRpc3RUZXJtU2VsZWN0aW9ucyA9IGRvY3VtZW50XHJcbiAgLmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLmFydGlzdFRlcm1TZWxlY3Rpb25zKSA/PyB0aHJvd0V4cHJlc3Npb24oYHRlcm0gc2VsZWN0aW9uIG9mIGlkICR7Y29uZmlnLkNTUy5JRHMuYXJ0aXN0VGVybVNlbGVjdGlvbnN9IGRvZXMgbm90IGV4aXN0YClcclxuY29uc3Qgc2VsZWN0aW9ucyA9IHtcclxuICB0ZXJtVGFiTWFuYWdlcjogbmV3IFNlbGVjdGFibGVUYWJFbHMoKVxyXG59XHJcblxyXG5jb25zdCBhZGRFdmVudExpc3RlbmVycyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgZnVuY3Rpb24gYWRkQXJ0aXN0VGVybUJ1dHRvbkV2ZW50cyAoKSB7XHJcbiAgICBmdW5jdGlvbiBvbkNsaWNrIChidG46IEVsZW1lbnQsIGJvcmRlckNvdmVyOiBFbGVtZW50KSB7XHJcbiAgICAgIGNvbnN0IGF0dHIgPSBidG4uZ2V0QXR0cmlidXRlKFxyXG4gICAgICAgIGNvbmZpZy5DU1MuQVRUUklCVVRFUy5kYXRhU2VsZWN0aW9uXHJcbiAgICAgICkgPz8gdGhyb3dFeHByZXNzaW9uKGBhdHRyaWJ1dGUgJHtjb25maWcuQ1NTLkFUVFJJQlVURVMuZGF0YVNlbGVjdGlvbn0gZG9lcyBub3QgZXhpc3Qgb24gdGVybSBidXR0b25gKVxyXG5cclxuICAgICAgYXJ0aXN0QWN0aW9ucy5zZWxlY3Rpb25zLnRlcm0gPSBkZXRlcm1pbmVUZXJtKGF0dHIpXHJcblxyXG4gICAgICBzYXZlVGVybShhcnRpc3RBY3Rpb25zLnNlbGVjdGlvbnMudGVybSwgVEVSTV9UWVBFLkFSVElTVFMpXHJcbiAgICAgIHNlbGVjdGlvbnMudGVybVRhYk1hbmFnZXIuc2VsZWN0TmV3VGFiKGJ0biwgYm9yZGVyQ292ZXIpXHJcblxyXG4gICAgICBjb25zdCBjdXJyQXJ0aXN0cyA9IGFydGlzdEFjdGlvbnMuZ2V0Q3VyclNlbFRvcEFydGlzdHMoKVxyXG4gICAgICBhcnRpc3RDYXJkc0hhbmRsZXIuZGlzcGxheUFydGlzdENhcmRzKGN1cnJBcnRpc3RzKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGFydGlzdFRlcm1CdG5zID0gYXJ0aXN0VGVybVNlbGVjdGlvbnMuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2J1dHRvbicpXHJcbiAgICBjb25zdCB0cmFja1Rlcm1Cb3JkZXJDb3ZlcnMgPSBhcnRpc3RUZXJtU2VsZWN0aW9ucy5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNvbmZpZy5DU1MuQ0xBU1NFUy5ib3JkZXJDb3ZlcilcclxuXHJcbiAgICBpZiAodHJhY2tUZXJtQm9yZGVyQ292ZXJzLmxlbmd0aCAhPT0gYXJ0aXN0VGVybUJ0bnMubGVuZ3RoKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ05vdCBhbGwgdHJhY2sgdGVybSBidXR0b25zIGNvbnRhaW4gYSBib3JkZXIgY292ZXInKVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJ0aXN0VGVybUJ0bnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgY29uc3QgYnRuID0gYXJ0aXN0VGVybUJ0bnNbaV1cclxuICAgICAgY29uc3QgYm9yZGVyQ292ZXIgPSB0cmFja1Rlcm1Cb3JkZXJDb3ZlcnNbaV1cclxuICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gb25DbGljayhidG4sIGJvcmRlckNvdmVyKSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBhZGRBcnRpc3RUZXJtQnV0dG9uRXZlbnRzXHJcbiAgfVxyXG59KSgpO1xyXG5cclxuKGZ1bmN0aW9uICgpIHtcclxuICBwcm9taXNlSGFuZGxlcihjaGVja0lmSGFzVG9rZW5zKCksIChoYXNUb2tlbikgPT5cclxuICAgIG9uU3VjY2Vzc2Z1bFRva2VuQ2FsbChoYXNUb2tlbiwgKCkgPT4ge1xyXG4gICAgICBsb2FkVGVybShURVJNX1RZUEUuQVJUSVNUUykudGhlbih0ZXJtID0+IHtcclxuICAgICAgICBhcnRpc3RBY3Rpb25zLnNlbGVjdGlvbnMudGVybSA9IHRlcm1cclxuICAgICAgICBhcnRpc3RDYXJkc0hhbmRsZXIuZGlzcGxheUFydGlzdENhcmRzKGFydGlzdEFjdGlvbnMuZ2V0Q3VyclNlbFRvcEFydGlzdHMoKSlcclxuICAgICAgICBzZWxlY3RTdGFydFRlcm1UYWIodGVybSwgc2VsZWN0aW9ucy50ZXJtVGFiTWFuYWdlciwgYXJ0aXN0VGVybVNlbGVjdGlvbnMpXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIClcclxuICBPYmplY3QuZW50cmllcyhhZGRFdmVudExpc3RlbmVycykuZm9yRWFjaCgoWywgYWRkRXZlbnRMaXN0ZW5lcl0pID0+IHtcclxuICAgIGFkZEV2ZW50TGlzdGVuZXIoKVxyXG4gIH0pXHJcbn0pKClcclxuIiwiaW1wb3J0IGF4aW9zLCB7IEF4aW9zUmVzcG9uc2UgfSBmcm9tICdheGlvcydcclxuaW1wb3J0IHsgY29uZmlnLCBwcm9taXNlSGFuZGxlciB9IGZyb20gJy4vY29uZmlnJ1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRpc3BsYXlVc2VybmFtZSAoKSB7XHJcbiAgcHJvbWlzZUhhbmRsZXI8QXhpb3NSZXNwb25zZTxzdHJpbmcgfCBudWxsPj4oYXhpb3MucmVxdWVzdDxzdHJpbmcgfCBudWxsPih7IG1ldGhvZDogJ0dFVCcsIHVybDogY29uZmlnLlVSTHMuZ2V0VXNlcm5hbWUgfSksIChyZXMpID0+IHtcclxuICAgIGNvbnN0IHVzZXJuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMudXNlcm5hbWUpXHJcbiAgICBpZiAodXNlcm5hbWUpIHtcclxuICAgICAgdXNlcm5hbWUudGV4dENvbnRlbnQgPSByZXMuZGF0YVxyXG4gICAgfVxyXG4gIH0pXHJcbn1cclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL3B1YmxpYy9wYWdlcy90b3AtYXJ0aXN0cy1wYWdlL3RvcC1hcnRpc3RzLnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9