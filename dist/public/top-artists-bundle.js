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

/***/ "./src/public/components/SelectableTabEls.ts":
/*!***************************************************!*\
  !*** ./src/public/components/SelectableTabEls.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const config_1 = __webpack_require__(/*! ../config */ "./src/public/config.ts");
class SelectableTabEls {
    constructor(btn, borderCover) {
        this.btn = btn;
        this.borderCover = borderCover;
    }
    unselectEls() {
        this.btn.classList.remove(config_1.config.CSS.CLASSES.selected);
        this.borderCover.classList.remove(config_1.config.CSS.CLASSES.selected);
    }
    selectEls() {
        this.btn.classList.add(config_1.config.CSS.CLASSES.selected);
        this.borderCover.classList.add(config_1.config.CSS.CLASSES.selected);
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
            duration: null,
            playPause: null
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
                        volume: 0.4
                    });
                    this._addListeners();
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
        <button id="${config_1.config.CSS.IDs.webPlayerPlayPause}"><img src="${config_1.config.PATHS.playBlackIcon}" alt="play/pause"/></button>
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
        const playPrev = document.getElementById(config_1.config.CSS.IDs.playPrev);
        const playPause = document.getElementById(config_1.config.CSS.IDs.webPlayerPlayPause);
        const playNext = document.getElementById(config_1.config.CSS.IDs.playNext);
        this.webPlayerEls.playPause = playPause;
        playPrev === null || playPrev === void 0 ? void 0 : playPrev.addEventListener('click', () => this.tryPlayPrev(this.selPlaying.trackDataNode));
        playPause === null || playPause === void 0 ? void 0 : playPause.addEventListener('click', () => this.tryWebPlayerPause(this.selPlaying.trackDataNode));
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
    /** Tries to pause the current playing IPlayable node from the web player.
     *
     * @param currNode - the current IPlayable node that was/is playing
     */
    tryWebPlayerPause(currNode) {
        // check to see if this is the first node or if an action is processing
        if (!this.isExecutingAction && currNode !== null) {
            const prevTrack = currNode.data;
            this.setSelPlayingEl(new track_play_args_1.default(prevTrack, currNode));
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
        var _a;
        if (this.selPlaying.element === null) {
            throw new Error('Selected playing element was null before deselection on song finish');
        }
        this.selPlaying.element.classList.remove(config_1.config.CSS.CLASSES.selected);
        (_a = this.webPlayerEls.playPause) === null || _a === void 0 ? void 0 : _a.classList.remove(config_1.config.CSS.CLASSES.selected);
        this.selPlaying.element = null;
    }
    selectTrack(eventArg) {
        var _a;
        this.selPlaying.trackDataNode = eventArg.playableNode;
        this.selPlaying.element = eventArg.currPlayable.selEl;
        this.selPlaying.element.classList.add(config_1.config.CSS.CLASSES.selected);
        this.selPlaying.track_uri = eventArg.currPlayable.uri;
        (_a = this.webPlayerEls.playPause) === null || _a === void 0 ? void 0 : _a.classList.add(config_1.config.CSS.CLASSES.selected);
        this.webPlayerEls.title.textContent = eventArg.currPlayable.title;
    }
    onTrackFinish() {
        this.completelyDeselectTrack();
        this.webPlayerEls.progress.style.width = '100%';
        clearInterval(this.getStateInterval);
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
                clearInterval(this.getStateInterval);
                // if its the same element then pause
                if (this.selPlaying.element === eventArg.currPlayable.selEl) {
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
                yield this.startTrack(() => __awaiter(this, void 0, void 0, function* () { return this.resume(); }), eventArg);
                this.isExecutingAction = false;
                return;
            }
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
    /** Plays a track through this device.
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
        const html = `
            <li class="${config_1.config.CSS.CLASSES.playlistTrack}">
              <button class="${config_1.config.CSS.CLASSES.playPause} ${(0, playback_sdk_1.isSamePlayingURI)(this.uri) ? config_1.config.CSS.CLASSES.selected : ''}"><img src="" alt="play/pause" 
              class="${config_1.config.CSS.CLASSES.noSelect}"/>
              </button>
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
            <div class="${config_1.config.CSS.CLASSES.rankedTrackInteract}">
              <button class="${config_1.config.CSS.CLASSES.playPause} ${(0, playback_sdk_1.isSamePlayingURI)(this.uri) ? config_1.config.CSS.CLASSES.selected : ''}"><img src="" alt="play/pause" 
                class="${config_1.config.CSS.CLASSES.noSelect}"/>
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
                  ${this.generateHTMLArtistNames()}
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
        playPauseBtn === null || playPauseBtn === void 0 ? void 0 : playPauseBtn.addEventListener('click', () => {
            // select the rank area as to keep the play/pause icon shown
            const rankedInteract = el.getElementsByClassName(config_1.config.CSS.CLASSES.rankedTrackInteract)[0];
            // rankedInteract.classList.toggle(config.CSS.CLASSES.selected)
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
            playPrev: 'play-prev',
            webPlayerPlayPause: 'play-pause-player'
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
            playPause: 'play-pause',
            rankedTrackInteract: 'ranked-card-interaction-area'
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
        playBlackIcon: '/images/play-black-30px.png',
        pauseBlackIcon: '/images/pause-black-30px.png',
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
const artist_1 = __webpack_require__(/*! ../../components/artist */ "./src/public/components/artist.ts");
const config_1 = __webpack_require__(/*! ../../config */ "./src/public/config.ts");
const SelectableTabEls_1 = __importDefault(__webpack_require__(/*! ../../components/SelectableTabEls */ "./src/public/components/SelectableTabEls.ts"));
const manage_tokens_1 = __webpack_require__(/*! ../../manage-tokens */ "./src/public/manage-tokens.ts");
const asyncSelectionVerif_1 = __importDefault(__webpack_require__(/*! ../../components/asyncSelectionVerif */ "./src/public/components/asyncSelectionVerif.ts"));
const axios_1 = __importDefault(__webpack_require__(/*! axios */ "./node_modules/axios/index.js"));
const MAX_VIEWABLE_CARDS = 5;
const artistActions = (function () {
    const selections = {
        numViewableCards: MAX_VIEWABLE_CARDS,
        term: 'short_term'
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
        if (selections.term === 'short_term') {
            return artistArrs.topArtistObjsShortTerm;
        }
        else if (selections.term === 'medium_term') {
            return artistArrs.topArtistObjsMidTerm;
        }
        else if (selections.term === 'long_term') {
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
    /** Generates the cards to the DOM then makes them visible
     *
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
    /** Begins retrieving artists then when done verifies it is the correct selected artist.
     *
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
const addEventListeners = (function () {
    var _a;
    const artistTermSelections = (_a = document
        .getElementById(config_1.config.CSS.IDs.artistTermSelections)) !== null && _a !== void 0 ? _a : (0, config_1.throwExpression)(`term selection of id ${config_1.config.CSS.IDs.artistTermSelections} does not exist`);
    const selections = {
        termTabManager: new SelectableTabEls_1.default(artistTermSelections.getElementsByTagName('button')[0], // first tab is selected first by default
        artistTermSelections.getElementsByClassName(config_1.config.CSS.CLASSES.borderCover)[0] // first tab is selected first by default
        )
    };
    function addArtistTermButtonEvents() {
        function onClick(btn, borderCover) {
            const attr = btn.getAttribute(config_1.config.CSS.ATTRIBUTES.dataSelection);
            if (attr === null) {
                (0, config_1.throwExpression)(`attribute ${config_1.config.CSS.ATTRIBUTES.dataSelection} does not exist on term button`);
            }
            artistActions.selections.term = attr;
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
    // function resetViewableCards () {
    //   const viewAllEl = document.getElementById(config.CSS.IDs.viewAllTopTracks)
    //   trackActions.selections.numViewableCards = DEFAULT_VIEWABLE_CARDS
    //   viewAllEl.textContent = 'See All 50'
    // }
    // function addViewAllTracksEvent () {
    //   const viewAllEl = document.getElementById(config.CSS.IDs.viewAllTopTracks)
    //   function onClick () {
    //     if (trackActions.selections.numViewableCards == DEFAULT_VIEWABLE_CARDS) {
    //       trackActions.selections.numViewableCards = MAX_VIEWABLE_CARDS
    //       viewAllEl.textContent = 'See Less'
    //     } else {
    //       resetViewableCards()
    //     }
    //     const currTracks = trackActions.getCurrSelTopTracks()
    //     displayCardInfo.displayTrackCards(currTracks)
    //   }
    //   viewAllEl.addEventListener('click', () => onClick())
    // }
    return {
        addArtistTermButtonEvents
        // addViewAllTracksEvent,
    };
})();
(function () {
    (0, config_1.promiseHandler)((0, manage_tokens_1.checkIfHasTokens)(), (hasToken) => (0, manage_tokens_1.onSuccessfulTokenCall)(hasToken, () => {
        // when entering the page always show short term tracks first
        artistActions.selections.term = 'short_term';
        artistCardsHandler.displayArtistCards(artistArrs.topArtistObjsShortTerm);
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
/******/ 	var __webpack_exports__ = __webpack_require__("./src/public/pages/top-artists-page/top-artists.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LGdCQUFnQixDQUFDLEVBQUUsRUFBRTtRQUNqRSxnQkFBZ0IsRUFBRTtJQUNwQixDQUFDLENBQUM7QUFDSixDQUFDLENBQUMsRUFBRTs7Ozs7OztVQ25RSjtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvaW5kZXguanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2FkYXB0ZXJzL3hoci5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvYXhpb3MuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWwuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWxUb2tlbi5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL2lzQ2FuY2VsLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0F4aW9zLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0ludGVyY2VwdG9yTWFuYWdlci5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9idWlsZEZ1bGxQYXRoLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2NyZWF0ZUVycm9yLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2Rpc3BhdGNoUmVxdWVzdC5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9lbmhhbmNlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvbWVyZ2VDb25maWcuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvc2V0dGxlLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3RyYW5zZm9ybURhdGEuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2RlZmF1bHRzLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2JpbmQuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYnVpbGRVUkwuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29tYmluZVVSTHMuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0Fic29sdXRlVVJMLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQXhpb3NFcnJvci5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc1VSTFNhbWVPcmlnaW4uanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZS5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9wYXJzZUhlYWRlcnMuanMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvc3ByZWFkLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi91dGlscy5qcyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL25vZGVfbW9kdWxlcy9pbnRlcmFjdGpzL2Rpc3QvaW50ZXJhY3QubWluLmpzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL1NlbGVjdGFibGVUYWJFbHMudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvYWxidW0udHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvYXJ0aXN0LnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL2FzeW5jU2VsZWN0aW9uVmVyaWYudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvY2FyZC50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9kb3VibHktbGlua2VkLWxpc3QudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL2NvbXBvbmVudHMvcGxheWJhY2stc2RrLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL3B1YnN1Yi9hZ2dyZWdhdG9yLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL3B1YnN1Yi9ldmVudC1hcmdzL3RyYWNrLXBsYXktYXJncy50cyIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS8uL3NyYy9wdWJsaWMvY29tcG9uZW50cy9wdWJzdWIvc3Vic2NyaXB0aW9uLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb21wb25lbnRzL3RyYWNrLnRzIiwid2VicGFjazovL3Nwb3RpZnktaW5mby1zaXRlLy4vc3JjL3B1YmxpYy9jb25maWcudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL21hbmFnZS10b2tlbnMudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvLi9zcmMvcHVibGljL3BhZ2VzL3RvcC1hcnRpc3RzLXBhZ2UvdG9wLWFydGlzdHMudHMiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9zcG90aWZ5LWluZm8tc2l0ZS93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vc3BvdGlmeS1pbmZvLXNpdGUvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvYXhpb3MnKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBzZXR0bGUgPSByZXF1aXJlKCcuLy4uL2NvcmUvc2V0dGxlJyk7XG52YXIgY29va2llcyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9jb29raWVzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBidWlsZEZ1bGxQYXRoID0gcmVxdWlyZSgnLi4vY29yZS9idWlsZEZ1bGxQYXRoJyk7XG52YXIgcGFyc2VIZWFkZXJzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL3BhcnNlSGVhZGVycycpO1xudmFyIGlzVVJMU2FtZU9yaWdpbiA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9pc1VSTFNhbWVPcmlnaW4nKTtcbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4uL2NvcmUvY3JlYXRlRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB4aHJBZGFwdGVyKGNvbmZpZykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZGlzcGF0Y2hYaHJSZXF1ZXN0KHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0RGF0YSA9IGNvbmZpZy5kYXRhO1xuICAgIHZhciByZXF1ZXN0SGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzO1xuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEocmVxdWVzdERhdGEpKSB7XG4gICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddOyAvLyBMZXQgdGhlIGJyb3dzZXIgc2V0IGl0XG4gICAgfVxuXG4gICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIC8vIEhUVFAgYmFzaWMgYXV0aGVudGljYXRpb25cbiAgICBpZiAoY29uZmlnLmF1dGgpIHtcbiAgICAgIHZhciB1c2VybmFtZSA9IGNvbmZpZy5hdXRoLnVzZXJuYW1lIHx8ICcnO1xuICAgICAgdmFyIHBhc3N3b3JkID0gY29uZmlnLmF1dGgucGFzc3dvcmQgPyB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoY29uZmlnLmF1dGgucGFzc3dvcmQpKSA6ICcnO1xuICAgICAgcmVxdWVzdEhlYWRlcnMuQXV0aG9yaXphdGlvbiA9ICdCYXNpYyAnICsgYnRvYSh1c2VybmFtZSArICc6JyArIHBhc3N3b3JkKTtcbiAgICB9XG5cbiAgICB2YXIgZnVsbFBhdGggPSBidWlsZEZ1bGxQYXRoKGNvbmZpZy5iYXNlVVJMLCBjb25maWcudXJsKTtcbiAgICByZXF1ZXN0Lm9wZW4oY29uZmlnLm1ldGhvZC50b1VwcGVyQ2FzZSgpLCBidWlsZFVSTChmdWxsUGF0aCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLCB0cnVlKTtcblxuICAgIC8vIFNldCB0aGUgcmVxdWVzdCB0aW1lb3V0IGluIE1TXG4gICAgcmVxdWVzdC50aW1lb3V0ID0gY29uZmlnLnRpbWVvdXQ7XG5cbiAgICAvLyBMaXN0ZW4gZm9yIHJlYWR5IHN0YXRlXG4gICAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiBoYW5kbGVMb2FkKCkge1xuICAgICAgaWYgKCFyZXF1ZXN0IHx8IHJlcXVlc3QucmVhZHlTdGF0ZSAhPT0gNCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFRoZSByZXF1ZXN0IGVycm9yZWQgb3V0IGFuZCB3ZSBkaWRuJ3QgZ2V0IGEgcmVzcG9uc2UsIHRoaXMgd2lsbCBiZVxuICAgICAgLy8gaGFuZGxlZCBieSBvbmVycm9yIGluc3RlYWRcbiAgICAgIC8vIFdpdGggb25lIGV4Y2VwdGlvbjogcmVxdWVzdCB0aGF0IHVzaW5nIGZpbGU6IHByb3RvY29sLCBtb3N0IGJyb3dzZXJzXG4gICAgICAvLyB3aWxsIHJldHVybiBzdGF0dXMgYXMgMCBldmVuIHRob3VnaCBpdCdzIGEgc3VjY2Vzc2Z1bCByZXF1ZXN0XG4gICAgICBpZiAocmVxdWVzdC5zdGF0dXMgPT09IDAgJiYgIShyZXF1ZXN0LnJlc3BvbnNlVVJMICYmIHJlcXVlc3QucmVzcG9uc2VVUkwuaW5kZXhPZignZmlsZTonKSA9PT0gMCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBQcmVwYXJlIHRoZSByZXNwb25zZVxuICAgICAgdmFyIHJlc3BvbnNlSGVhZGVycyA9ICdnZXRBbGxSZXNwb25zZUhlYWRlcnMnIGluIHJlcXVlc3QgPyBwYXJzZUhlYWRlcnMocmVxdWVzdC5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkgOiBudWxsO1xuICAgICAgdmFyIHJlc3BvbnNlRGF0YSA9ICFjb25maWcucmVzcG9uc2VUeXBlIHx8IGNvbmZpZy5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JyA/IHJlcXVlc3QucmVzcG9uc2VUZXh0IDogcmVxdWVzdC5yZXNwb25zZTtcbiAgICAgIHZhciByZXNwb25zZSA9IHtcbiAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLFxuICAgICAgICBzdGF0dXM6IHJlcXVlc3Quc3RhdHVzLFxuICAgICAgICBzdGF0dXNUZXh0OiByZXF1ZXN0LnN0YXR1c1RleHQsXG4gICAgICAgIGhlYWRlcnM6IHJlc3BvbnNlSGVhZGVycyxcbiAgICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAgIHJlcXVlc3Q6IHJlcXVlc3RcbiAgICAgIH07XG5cbiAgICAgIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBicm93c2VyIHJlcXVlc3QgY2FuY2VsbGF0aW9uIChhcyBvcHBvc2VkIHRvIGEgbWFudWFsIGNhbmNlbGxhdGlvbilcbiAgICByZXF1ZXN0Lm9uYWJvcnQgPSBmdW5jdGlvbiBoYW5kbGVBYm9ydCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignUmVxdWVzdCBhYm9ydGVkJywgY29uZmlnLCAnRUNPTk5BQk9SVEVEJywgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIGxvdyBsZXZlbCBuZXR3b3JrIGVycm9yc1xuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uIGhhbmRsZUVycm9yKCkge1xuICAgICAgLy8gUmVhbCBlcnJvcnMgYXJlIGhpZGRlbiBmcm9tIHVzIGJ5IHRoZSBicm93c2VyXG4gICAgICAvLyBvbmVycm9yIHNob3VsZCBvbmx5IGZpcmUgaWYgaXQncyBhIG5ldHdvcmsgZXJyb3JcbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignTmV0d29yayBFcnJvcicsIGNvbmZpZywgbnVsbCwgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIHRpbWVvdXRcbiAgICByZXF1ZXN0Lm9udGltZW91dCA9IGZ1bmN0aW9uIGhhbmRsZVRpbWVvdXQoKSB7XG4gICAgICB2YXIgdGltZW91dEVycm9yTWVzc2FnZSA9ICd0aW1lb3V0IG9mICcgKyBjb25maWcudGltZW91dCArICdtcyBleGNlZWRlZCc7XG4gICAgICBpZiAoY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2UpIHtcbiAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZSA9IGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlO1xuICAgICAgfVxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKHRpbWVvdXRFcnJvck1lc3NhZ2UsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsXG4gICAgICAgIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgIC8vIFRoaXMgaXMgb25seSBkb25lIGlmIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50LlxuICAgIC8vIFNwZWNpZmljYWxseSBub3QgaWYgd2UncmUgaW4gYSB3ZWIgd29ya2VyLCBvciByZWFjdC1uYXRpdmUuXG4gICAgaWYgKHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkpIHtcbiAgICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgICAgdmFyIHhzcmZWYWx1ZSA9IChjb25maWcud2l0aENyZWRlbnRpYWxzIHx8IGlzVVJMU2FtZU9yaWdpbihmdWxsUGF0aCkpICYmIGNvbmZpZy54c3JmQ29va2llTmFtZSA/XG4gICAgICAgIGNvb2tpZXMucmVhZChjb25maWcueHNyZkNvb2tpZU5hbWUpIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuXG4gICAgICBpZiAoeHNyZlZhbHVlKSB7XG4gICAgICAgIHJlcXVlc3RIZWFkZXJzW2NvbmZpZy54c3JmSGVhZGVyTmFtZV0gPSB4c3JmVmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRkIGhlYWRlcnMgdG8gdGhlIHJlcXVlc3RcbiAgICBpZiAoJ3NldFJlcXVlc3RIZWFkZXInIGluIHJlcXVlc3QpIHtcbiAgICAgIHV0aWxzLmZvckVhY2gocmVxdWVzdEhlYWRlcnMsIGZ1bmN0aW9uIHNldFJlcXVlc3RIZWFkZXIodmFsLCBrZXkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZXF1ZXN0RGF0YSA9PT0gJ3VuZGVmaW5lZCcgJiYga2V5LnRvTG93ZXJDYXNlKCkgPT09ICdjb250ZW50LXR5cGUnKSB7XG4gICAgICAgICAgLy8gUmVtb3ZlIENvbnRlbnQtVHlwZSBpZiBkYXRhIGlzIHVuZGVmaW5lZFxuICAgICAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1trZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE90aGVyd2lzZSBhZGQgaGVhZGVyIHRvIHRoZSByZXF1ZXN0XG4gICAgICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgdmFsKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIHdpdGhDcmVkZW50aWFscyB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnLndpdGhDcmVkZW50aWFscykpIHtcbiAgICAgIHJlcXVlc3Qud2l0aENyZWRlbnRpYWxzID0gISFjb25maWcud2l0aENyZWRlbnRpYWxzO1xuICAgIH1cblxuICAgIC8vIEFkZCByZXNwb25zZVR5cGUgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoY29uZmlnLnJlc3BvbnNlVHlwZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBFeHBlY3RlZCBET01FeGNlcHRpb24gdGhyb3duIGJ5IGJyb3dzZXJzIG5vdCBjb21wYXRpYmxlIFhNTEh0dHBSZXF1ZXN0IExldmVsIDIuXG4gICAgICAgIC8vIEJ1dCwgdGhpcyBjYW4gYmUgc3VwcHJlc3NlZCBmb3IgJ2pzb24nIHR5cGUgYXMgaXQgY2FuIGJlIHBhcnNlZCBieSBkZWZhdWx0ICd0cmFuc2Zvcm1SZXNwb25zZScgZnVuY3Rpb24uXG4gICAgICAgIGlmIChjb25maWcucmVzcG9uc2VUeXBlICE9PSAnanNvbicpIHtcbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHByb2dyZXNzIGlmIG5lZWRlZFxuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIC8vIE5vdCBhbGwgYnJvd3NlcnMgc3VwcG9ydCB1cGxvYWQgZXZlbnRzXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25VcGxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJyAmJiByZXF1ZXN0LnVwbG9hZCkge1xuICAgICAgcmVxdWVzdC51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25VcGxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgICAgLy8gSGFuZGxlIGNhbmNlbGxhdGlvblxuICAgICAgY29uZmlnLmNhbmNlbFRva2VuLnByb21pc2UudGhlbihmdW5jdGlvbiBvbkNhbmNlbGVkKGNhbmNlbCkge1xuICAgICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICByZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgIHJlamVjdChjYW5jZWwpO1xuICAgICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFyZXF1ZXN0RGF0YSkge1xuICAgICAgcmVxdWVzdERhdGEgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFNlbmQgdGhlIHJlcXVlc3RcbiAgICByZXF1ZXN0LnNlbmQocmVxdWVzdERhdGEpO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcbnZhciBBeGlvcyA9IHJlcXVpcmUoJy4vY29yZS9BeGlvcycpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9jb3JlL21lcmdlQ29uZmlnJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqIEByZXR1cm4ge0F4aW9zfSBBIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICovXG5mdW5jdGlvbiBjcmVhdGVJbnN0YW5jZShkZWZhdWx0Q29uZmlnKSB7XG4gIHZhciBjb250ZXh0ID0gbmV3IEF4aW9zKGRlZmF1bHRDb25maWcpO1xuICB2YXIgaW5zdGFuY2UgPSBiaW5kKEF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0LCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGF4aW9zLnByb3RvdHlwZSB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIEF4aW9zLnByb3RvdHlwZSwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBjb250ZXh0IHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgY29udGV4dCk7XG5cbiAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG4vLyBDcmVhdGUgdGhlIGRlZmF1bHQgaW5zdGFuY2UgdG8gYmUgZXhwb3J0ZWRcbnZhciBheGlvcyA9IGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRzKTtcblxuLy8gRXhwb3NlIEF4aW9zIGNsYXNzIHRvIGFsbG93IGNsYXNzIGluaGVyaXRhbmNlXG5heGlvcy5BeGlvcyA9IEF4aW9zO1xuXG4vLyBGYWN0b3J5IGZvciBjcmVhdGluZyBuZXcgaW5zdGFuY2VzXG5heGlvcy5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoaW5zdGFuY2VDb25maWcpIHtcbiAgcmV0dXJuIGNyZWF0ZUluc3RhbmNlKG1lcmdlQ29uZmlnKGF4aW9zLmRlZmF1bHRzLCBpbnN0YW5jZUNvbmZpZykpO1xufTtcblxuLy8gRXhwb3NlIENhbmNlbCAmIENhbmNlbFRva2VuXG5heGlvcy5DYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWwnKTtcbmF4aW9zLkNhbmNlbFRva2VuID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsVG9rZW4nKTtcbmF4aW9zLmlzQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvaXNDYW5jZWwnKTtcblxuLy8gRXhwb3NlIGFsbC9zcHJlYWRcbmF4aW9zLmFsbCA9IGZ1bmN0aW9uIGFsbChwcm9taXNlcykge1xuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xufTtcbmF4aW9zLnNwcmVhZCA9IHJlcXVpcmUoJy4vaGVscGVycy9zcHJlYWQnKTtcblxuLy8gRXhwb3NlIGlzQXhpb3NFcnJvclxuYXhpb3MuaXNBeGlvc0Vycm9yID0gcmVxdWlyZSgnLi9oZWxwZXJzL2lzQXhpb3NFcnJvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aW9zO1xuXG4vLyBBbGxvdyB1c2Ugb2YgZGVmYXVsdCBpbXBvcnQgc3ludGF4IGluIFR5cGVTY3JpcHRcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBheGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBIGBDYW5jZWxgIGlzIGFuIG9iamVjdCB0aGF0IGlzIHRocm93biB3aGVuIGFuIG9wZXJhdGlvbiBpcyBjYW5jZWxlZC5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nPX0gbWVzc2FnZSBUaGUgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsKG1lc3NhZ2UpIHtcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn1cblxuQ2FuY2VsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gJ0NhbmNlbCcgKyAodGhpcy5tZXNzYWdlID8gJzogJyArIHRoaXMubWVzc2FnZSA6ICcnKTtcbn07XG5cbkNhbmNlbC5wcm90b3R5cGUuX19DQU5DRUxfXyA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi9DYW5jZWwnKTtcblxuLyoqXG4gKiBBIGBDYW5jZWxUb2tlbmAgaXMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgYW4gb3BlcmF0aW9uLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZXhlY3V0b3IgVGhlIGV4ZWN1dG9yIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBDYW5jZWxUb2tlbihleGVjdXRvcikge1xuICBpZiAodHlwZW9mIGV4ZWN1dG9yICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZXhlY3V0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uLicpO1xuICB9XG5cbiAgdmFyIHJlc29sdmVQcm9taXNlO1xuICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiBwcm9taXNlRXhlY3V0b3IocmVzb2x2ZSkge1xuICAgIHJlc29sdmVQcm9taXNlID0gcmVzb2x2ZTtcbiAgfSk7XG5cbiAgdmFyIHRva2VuID0gdGhpcztcbiAgZXhlY3V0b3IoZnVuY3Rpb24gY2FuY2VsKG1lc3NhZ2UpIHtcbiAgICBpZiAodG9rZW4ucmVhc29uKSB7XG4gICAgICAvLyBDYW5jZWxsYXRpb24gaGFzIGFscmVhZHkgYmVlbiByZXF1ZXN0ZWRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0b2tlbi5yZWFzb24gPSBuZXcgQ2FuY2VsKG1lc3NhZ2UpO1xuICAgIHJlc29sdmVQcm9taXNlKHRva2VuLnJlYXNvbik7XG4gIH0pO1xufVxuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbkNhbmNlbFRva2VuLnByb3RvdHlwZS50aHJvd0lmUmVxdWVzdGVkID0gZnVuY3Rpb24gdGhyb3dJZlJlcXVlc3RlZCgpIHtcbiAgaWYgKHRoaXMucmVhc29uKSB7XG4gICAgdGhyb3cgdGhpcy5yZWFzb247XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgdGhhdCBjb250YWlucyBhIG5ldyBgQ2FuY2VsVG9rZW5gIGFuZCBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLFxuICogY2FuY2VscyB0aGUgYENhbmNlbFRva2VuYC5cbiAqL1xuQ2FuY2VsVG9rZW4uc291cmNlID0gZnVuY3Rpb24gc291cmNlKCkge1xuICB2YXIgY2FuY2VsO1xuICB2YXIgdG9rZW4gPSBuZXcgQ2FuY2VsVG9rZW4oZnVuY3Rpb24gZXhlY3V0b3IoYykge1xuICAgIGNhbmNlbCA9IGM7XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIHRva2VuOiB0b2tlbixcbiAgICBjYW5jZWw6IGNhbmNlbFxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWxUb2tlbjtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0NhbmNlbCh2YWx1ZSkge1xuICByZXR1cm4gISEodmFsdWUgJiYgdmFsdWUuX19DQU5DRUxfXyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgSW50ZXJjZXB0b3JNYW5hZ2VyID0gcmVxdWlyZSgnLi9JbnRlcmNlcHRvck1hbmFnZXInKTtcbnZhciBkaXNwYXRjaFJlcXVlc3QgPSByZXF1aXJlKCcuL2Rpc3BhdGNoUmVxdWVzdCcpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9tZXJnZUNvbmZpZycpO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnN0YW5jZUNvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBBeGlvcyhpbnN0YW5jZUNvbmZpZykge1xuICB0aGlzLmRlZmF1bHRzID0gaW5zdGFuY2VDb25maWc7XG4gIHRoaXMuaW50ZXJjZXB0b3JzID0ge1xuICAgIHJlcXVlc3Q6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKSxcbiAgICByZXNwb25zZTogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpXG4gIH07XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHNwZWNpZmljIGZvciB0aGlzIHJlcXVlc3QgKG1lcmdlZCB3aXRoIHRoaXMuZGVmYXVsdHMpXG4gKi9cbkF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdChjb25maWcpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIC8vIEFsbG93IGZvciBheGlvcygnZXhhbXBsZS91cmwnWywgY29uZmlnXSkgYSBsYSBmZXRjaCBBUElcbiAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uZmlnID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuICAgIGNvbmZpZy51cmwgPSBhcmd1bWVudHNbMF07XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICB9XG5cbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcblxuICAvLyBTZXQgY29uZmlnLm1ldGhvZFxuICBpZiAoY29uZmlnLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSBjb25maWcubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSBpZiAodGhpcy5kZWZhdWx0cy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gdGhpcy5kZWZhdWx0cy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcubWV0aG9kID0gJ2dldCc7XG4gIH1cblxuICAvLyBIb29rIHVwIGludGVyY2VwdG9ycyBtaWRkbGV3YXJlXG4gIHZhciBjaGFpbiA9IFtkaXNwYXRjaFJlcXVlc3QsIHVuZGVmaW5lZF07XG4gIHZhciBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGNvbmZpZyk7XG5cbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVxdWVzdC5mb3JFYWNoKGZ1bmN0aW9uIHVuc2hpZnRSZXF1ZXN0SW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgY2hhaW4udW5zaGlmdChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVzcG9uc2UuZm9yRWFjaChmdW5jdGlvbiBwdXNoUmVzcG9uc2VJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICBjaGFpbi5wdXNoKGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB3aGlsZSAoY2hhaW4ubGVuZ3RoKSB7XG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihjaGFpbi5zaGlmdCgpLCBjaGFpbi5zaGlmdCgpKTtcbiAgfVxuXG4gIHJldHVybiBwcm9taXNlO1xufTtcblxuQXhpb3MucHJvdG90eXBlLmdldFVyaSA9IGZ1bmN0aW9uIGdldFVyaShjb25maWcpIHtcbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcbiAgcmV0dXJuIGJ1aWxkVVJMKGNvbmZpZy51cmwsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKS5yZXBsYWNlKC9eXFw/LywgJycpO1xufTtcblxuLy8gUHJvdmlkZSBhbGlhc2VzIGZvciBzdXBwb3J0ZWQgcmVxdWVzdCBtZXRob2RzXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ29wdGlvbnMnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogKGNvbmZpZyB8fCB7fSkuZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiBkYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gSW50ZXJjZXB0b3JNYW5hZ2VyKCkge1xuICB0aGlzLmhhbmRsZXJzID0gW107XG59XG5cbi8qKlxuICogQWRkIGEgbmV3IGludGVyY2VwdG9yIHRvIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bGZpbGxlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGB0aGVuYCBmb3IgYSBgUHJvbWlzZWBcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHJlamVjdGAgZm9yIGEgYFByb21pc2VgXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBBbiBJRCB1c2VkIHRvIHJlbW92ZSBpbnRlcmNlcHRvciBsYXRlclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uIHVzZShmdWxmaWxsZWQsIHJlamVjdGVkKSB7XG4gIHRoaXMuaGFuZGxlcnMucHVzaCh7XG4gICAgZnVsZmlsbGVkOiBmdWxmaWxsZWQsXG4gICAgcmVqZWN0ZWQ6IHJlamVjdGVkXG4gIH0pO1xuICByZXR1cm4gdGhpcy5oYW5kbGVycy5sZW5ndGggLSAxO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYW4gaW50ZXJjZXB0b3IgZnJvbSB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaWQgVGhlIElEIHRoYXQgd2FzIHJldHVybmVkIGJ5IGB1c2VgXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZWplY3QgPSBmdW5jdGlvbiBlamVjdChpZCkge1xuICBpZiAodGhpcy5oYW5kbGVyc1tpZF0pIHtcbiAgICB0aGlzLmhhbmRsZXJzW2lkXSA9IG51bGw7XG4gIH1cbn07XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFsbCB0aGUgcmVnaXN0ZXJlZCBpbnRlcmNlcHRvcnNcbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBwYXJ0aWN1bGFybHkgdXNlZnVsIGZvciBza2lwcGluZyBvdmVyIGFueVxuICogaW50ZXJjZXB0b3JzIHRoYXQgbWF5IGhhdmUgYmVjb21lIGBudWxsYCBjYWxsaW5nIGBlamVjdGAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggaW50ZXJjZXB0b3JcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaChmbikge1xuICB1dGlscy5mb3JFYWNoKHRoaXMuaGFuZGxlcnMsIGZ1bmN0aW9uIGZvckVhY2hIYW5kbGVyKGgpIHtcbiAgICBpZiAoaCAhPT0gbnVsbCkge1xuICAgICAgZm4oaCk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJjZXB0b3JNYW5hZ2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaXNBYnNvbHV0ZVVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTCcpO1xudmFyIGNvbWJpbmVVUkxzID0gcmVxdWlyZSgnLi4vaGVscGVycy9jb21iaW5lVVJMcycpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgYmFzZVVSTCB3aXRoIHRoZSByZXF1ZXN0ZWRVUkwsXG4gKiBvbmx5IHdoZW4gdGhlIHJlcXVlc3RlZFVSTCBpcyBub3QgYWxyZWFkeSBhbiBhYnNvbHV0ZSBVUkwuXG4gKiBJZiB0aGUgcmVxdWVzdFVSTCBpcyBhYnNvbHV0ZSwgdGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSByZXF1ZXN0ZWRVUkwgdW50b3VjaGVkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlcXVlc3RlZFVSTCBBYnNvbHV0ZSBvciByZWxhdGl2ZSBVUkwgdG8gY29tYmluZVxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIGZ1bGwgcGF0aFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkRnVsbFBhdGgoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKSB7XG4gIGlmIChiYXNlVVJMICYmICFpc0Fic29sdXRlVVJMKHJlcXVlc3RlZFVSTCkpIHtcbiAgICByZXR1cm4gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKTtcbiAgfVxuICByZXR1cm4gcmVxdWVzdGVkVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vZW5oYW5jZUVycm9yJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBtZXNzYWdlLCBjb25maWcsIGVycm9yIGNvZGUsIHJlcXVlc3QgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBjcmVhdGVkIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUVycm9yKG1lc3NhZ2UsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciB0cmFuc2Zvcm1EYXRhID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1EYXRhJyk7XG52YXIgaXNDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvaXNDYW5jZWwnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuZnVuY3Rpb24gdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpIHtcbiAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgIGNvbmZpZy5jYW5jZWxUb2tlbi50aHJvd0lmUmVxdWVzdGVkKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3QgdG8gdGhlIHNlcnZlciB1c2luZyB0aGUgY29uZmlndXJlZCBhZGFwdGVyLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyB0aGF0IGlzIHRvIGJlIHVzZWQgZm9yIHRoZSByZXF1ZXN0XG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gVGhlIFByb21pc2UgdG8gYmUgZnVsZmlsbGVkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGlzcGF0Y2hSZXF1ZXN0KGNvbmZpZykge1xuICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgLy8gRW5zdXJlIGhlYWRlcnMgZXhpc3RcbiAgY29uZmlnLmhlYWRlcnMgPSBjb25maWcuaGVhZGVycyB8fCB7fTtcblxuICAvLyBUcmFuc2Zvcm0gcmVxdWVzdCBkYXRhXG4gIGNvbmZpZy5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICBjb25maWcuZGF0YSxcbiAgICBjb25maWcuaGVhZGVycyxcbiAgICBjb25maWcudHJhbnNmb3JtUmVxdWVzdFxuICApO1xuXG4gIC8vIEZsYXR0ZW4gaGVhZGVyc1xuICBjb25maWcuaGVhZGVycyA9IHV0aWxzLm1lcmdlKFxuICAgIGNvbmZpZy5oZWFkZXJzLmNvbW1vbiB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1tjb25maWcubWV0aG9kXSB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1xuICApO1xuXG4gIHV0aWxzLmZvckVhY2goXG4gICAgWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAncG9zdCcsICdwdXQnLCAncGF0Y2gnLCAnY29tbW9uJ10sXG4gICAgZnVuY3Rpb24gY2xlYW5IZWFkZXJDb25maWcobWV0aG9kKSB7XG4gICAgICBkZWxldGUgY29uZmlnLmhlYWRlcnNbbWV0aG9kXTtcbiAgICB9XG4gICk7XG5cbiAgdmFyIGFkYXB0ZXIgPSBjb25maWcuYWRhcHRlciB8fCBkZWZhdWx0cy5hZGFwdGVyO1xuXG4gIHJldHVybiBhZGFwdGVyKGNvbmZpZykudGhlbihmdW5jdGlvbiBvbkFkYXB0ZXJSZXNvbHV0aW9uKHJlc3BvbnNlKSB7XG4gICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICByZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICAgIHJlc3BvbnNlLmRhdGEsXG4gICAgICByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgKTtcblxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSwgZnVuY3Rpb24gb25BZGFwdGVyUmVqZWN0aW9uKHJlYXNvbikge1xuICAgIGlmICghaXNDYW5jZWwocmVhc29uKSkge1xuICAgICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgICAgaWYgKHJlYXNvbiAmJiByZWFzb24ucmVzcG9uc2UpIHtcbiAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhKFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZWFzb24pO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXBkYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBjb25maWcsIGVycm9yIGNvZGUsIGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgZXJyb3IgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgZXJyb3IuY29uZmlnID0gY29uZmlnO1xuICBpZiAoY29kZSkge1xuICAgIGVycm9yLmNvZGUgPSBjb2RlO1xuICB9XG5cbiAgZXJyb3IucmVxdWVzdCA9IHJlcXVlc3Q7XG4gIGVycm9yLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIGVycm9yLmlzQXhpb3NFcnJvciA9IHRydWU7XG5cbiAgZXJyb3IudG9KU09OID0gZnVuY3Rpb24gdG9KU09OKCkge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBTdGFuZGFyZFxuICAgICAgbWVzc2FnZTogdGhpcy5tZXNzYWdlLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgLy8gTWljcm9zb2Z0XG4gICAgICBkZXNjcmlwdGlvbjogdGhpcy5kZXNjcmlwdGlvbixcbiAgICAgIG51bWJlcjogdGhpcy5udW1iZXIsXG4gICAgICAvLyBNb3ppbGxhXG4gICAgICBmaWxlTmFtZTogdGhpcy5maWxlTmFtZSxcbiAgICAgIGxpbmVOdW1iZXI6IHRoaXMubGluZU51bWJlcixcbiAgICAgIGNvbHVtbk51bWJlcjogdGhpcy5jb2x1bW5OdW1iZXIsXG4gICAgICBzdGFjazogdGhpcy5zdGFjayxcbiAgICAgIC8vIEF4aW9zXG4gICAgICBjb25maWc6IHRoaXMuY29uZmlnLFxuICAgICAgY29kZTogdGhpcy5jb2RlXG4gICAgfTtcbiAgfTtcbiAgcmV0dXJuIGVycm9yO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBDb25maWctc3BlY2lmaWMgbWVyZ2UtZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhIG5ldyBjb25maWctb2JqZWN0XG4gKiBieSBtZXJnaW5nIHR3byBjb25maWd1cmF0aW9uIG9iamVjdHMgdG9nZXRoZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzFcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBOZXcgb2JqZWN0IHJlc3VsdGluZyBmcm9tIG1lcmdpbmcgY29uZmlnMiB0byBjb25maWcxXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWVyZ2VDb25maWcoY29uZmlnMSwgY29uZmlnMikge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgY29uZmlnMiA9IGNvbmZpZzIgfHwge307XG4gIHZhciBjb25maWcgPSB7fTtcblxuICB2YXIgdmFsdWVGcm9tQ29uZmlnMktleXMgPSBbJ3VybCcsICdtZXRob2QnLCAnZGF0YSddO1xuICB2YXIgbWVyZ2VEZWVwUHJvcGVydGllc0tleXMgPSBbJ2hlYWRlcnMnLCAnYXV0aCcsICdwcm94eScsICdwYXJhbXMnXTtcbiAgdmFyIGRlZmF1bHRUb0NvbmZpZzJLZXlzID0gW1xuICAgICdiYXNlVVJMJywgJ3RyYW5zZm9ybVJlcXVlc3QnLCAndHJhbnNmb3JtUmVzcG9uc2UnLCAncGFyYW1zU2VyaWFsaXplcicsXG4gICAgJ3RpbWVvdXQnLCAndGltZW91dE1lc3NhZ2UnLCAnd2l0aENyZWRlbnRpYWxzJywgJ2FkYXB0ZXInLCAncmVzcG9uc2VUeXBlJywgJ3hzcmZDb29raWVOYW1lJyxcbiAgICAneHNyZkhlYWRlck5hbWUnLCAnb25VcGxvYWRQcm9ncmVzcycsICdvbkRvd25sb2FkUHJvZ3Jlc3MnLCAnZGVjb21wcmVzcycsXG4gICAgJ21heENvbnRlbnRMZW5ndGgnLCAnbWF4Qm9keUxlbmd0aCcsICdtYXhSZWRpcmVjdHMnLCAndHJhbnNwb3J0JywgJ2h0dHBBZ2VudCcsXG4gICAgJ2h0dHBzQWdlbnQnLCAnY2FuY2VsVG9rZW4nLCAnc29ja2V0UGF0aCcsICdyZXNwb25zZUVuY29kaW5nJ1xuICBdO1xuICB2YXIgZGlyZWN0TWVyZ2VLZXlzID0gWyd2YWxpZGF0ZVN0YXR1cyddO1xuXG4gIGZ1bmN0aW9uIGdldE1lcmdlZFZhbHVlKHRhcmdldCwgc291cmNlKSB7XG4gICAgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3QodGFyZ2V0KSAmJiB1dGlscy5pc1BsYWluT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5tZXJnZSh0YXJnZXQsIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5tZXJnZSh7fSwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzQXJyYXkoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHNvdXJjZS5zbGljZSgpO1xuICAgIH1cbiAgICByZXR1cm4gc291cmNlO1xuICB9XG5cbiAgZnVuY3Rpb24gbWVyZ2VEZWVwUHJvcGVydGllcyhwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgdXRpbHMuZm9yRWFjaCh2YWx1ZUZyb21Db25maWcyS2V5cywgZnVuY3Rpb24gdmFsdWVGcm9tQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHV0aWxzLmZvckVhY2gobWVyZ2VEZWVwUHJvcGVydGllc0tleXMsIG1lcmdlRGVlcFByb3BlcnRpZXMpO1xuXG4gIHV0aWxzLmZvckVhY2goZGVmYXVsdFRvQ29uZmlnMktleXMsIGZ1bmN0aW9uIGRlZmF1bHRUb0NvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB1dGlscy5mb3JFYWNoKGRpcmVjdE1lcmdlS2V5cywgZnVuY3Rpb24gbWVyZ2UocHJvcCkge1xuICAgIGlmIChwcm9wIGluIGNvbmZpZzIpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAocHJvcCBpbiBjb25maWcxKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIGF4aW9zS2V5cyA9IHZhbHVlRnJvbUNvbmZpZzJLZXlzXG4gICAgLmNvbmNhdChtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cylcbiAgICAuY29uY2F0KGRlZmF1bHRUb0NvbmZpZzJLZXlzKVxuICAgIC5jb25jYXQoZGlyZWN0TWVyZ2VLZXlzKTtcblxuICB2YXIgb3RoZXJLZXlzID0gT2JqZWN0XG4gICAgLmtleXMoY29uZmlnMSlcbiAgICAuY29uY2F0KE9iamVjdC5rZXlzKGNvbmZpZzIpKVxuICAgIC5maWx0ZXIoZnVuY3Rpb24gZmlsdGVyQXhpb3NLZXlzKGtleSkge1xuICAgICAgcmV0dXJuIGF4aW9zS2V5cy5pbmRleE9mKGtleSkgPT09IC0xO1xuICAgIH0pO1xuXG4gIHV0aWxzLmZvckVhY2gob3RoZXJLZXlzLCBtZXJnZURlZXBQcm9wZXJ0aWVzKTtcblxuICByZXR1cm4gY29uZmlnO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi9jcmVhdGVFcnJvcicpO1xuXG4vKipcbiAqIFJlc29sdmUgb3IgcmVqZWN0IGEgUHJvbWlzZSBiYXNlZCBvbiByZXNwb25zZSBzdGF0dXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVzb2x2ZSBBIGZ1bmN0aW9uIHRoYXQgcmVzb2x2ZXMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3QgQSBmdW5jdGlvbiB0aGF0IHJlamVjdHMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgVGhlIHJlc3BvbnNlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKSB7XG4gIHZhciB2YWxpZGF0ZVN0YXR1cyA9IHJlc3BvbnNlLmNvbmZpZy52YWxpZGF0ZVN0YXR1cztcbiAgaWYgKCFyZXNwb25zZS5zdGF0dXMgfHwgIXZhbGlkYXRlU3RhdHVzIHx8IHZhbGlkYXRlU3RhdHVzKHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgfSBlbHNlIHtcbiAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAnUmVxdWVzdCBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZSAnICsgcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgcmVzcG9uc2UuY29uZmlnLFxuICAgICAgbnVsbCxcbiAgICAgIHJlc3BvbnNlLnJlcXVlc3QsXG4gICAgICByZXNwb25zZVxuICAgICkpO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoZSBkYXRhIGZvciBhIHJlcXVlc3Qgb3IgYSByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBiZSB0cmFuc2Zvcm1lZFxuICogQHBhcmFtIHtBcnJheX0gaGVhZGVycyBUaGUgaGVhZGVycyBmb3IgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqIEBwYXJhbSB7QXJyYXl8RnVuY3Rpb259IGZucyBBIHNpbmdsZSBmdW5jdGlvbiBvciBBcnJheSBvZiBmdW5jdGlvbnNcbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0aW5nIHRyYW5zZm9ybWVkIGRhdGFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cmFuc2Zvcm1EYXRhKGRhdGEsIGhlYWRlcnMsIGZucykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgdXRpbHMuZm9yRWFjaChmbnMsIGZ1bmN0aW9uIHRyYW5zZm9ybShmbikge1xuICAgIGRhdGEgPSBmbihkYXRhLCBoZWFkZXJzKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRhdGE7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgbm9ybWFsaXplSGVhZGVyTmFtZSA9IHJlcXVpcmUoJy4vaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lJyk7XG5cbnZhciBERUZBVUxUX0NPTlRFTlRfVFlQRSA9IHtcbiAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG5mdW5jdGlvbiBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgdmFsdWUpIHtcbiAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzKSAmJiB1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzWydDb250ZW50LVR5cGUnXSkpIHtcbiAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHZhbHVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRBZGFwdGVyKCkge1xuICB2YXIgYWRhcHRlcjtcbiAgaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBGb3IgYnJvd3NlcnMgdXNlIFhIUiBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMveGhyJyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nKSB7XG4gICAgLy8gRm9yIG5vZGUgdXNlIEhUVFAgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL2h0dHAnKTtcbiAgfVxuICByZXR1cm4gYWRhcHRlcjtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuICBhZGFwdGVyOiBnZXREZWZhdWx0QWRhcHRlcigpLFxuXG4gIHRyYW5zZm9ybVJlcXVlc3Q6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXF1ZXN0KGRhdGEsIGhlYWRlcnMpIHtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdBY2NlcHQnKTtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdDb250ZW50LVR5cGUnKTtcbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNBcnJheUJ1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIHRyYW5zZm9ybVJlc3BvbnNlOiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVzcG9uc2UoZGF0YSkge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkgeyAvKiBJZ25vcmUgKi8gfVxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgLyoqXG4gICAqIEEgdGltZW91dCBpbiBtaWxsaXNlY29uZHMgdG8gYWJvcnQgYSByZXF1ZXN0LiBJZiBzZXQgdG8gMCAoZGVmYXVsdCkgYVxuICAgKiB0aW1lb3V0IGlzIG5vdCBjcmVhdGVkLlxuICAgKi9cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG4gIG1heEJvZHlMZW5ndGg6IC0xLFxuXG4gIHZhbGlkYXRlU3RhdHVzOiBmdW5jdGlvbiB2YWxpZGF0ZVN0YXR1cyhzdGF0dXMpIHtcbiAgICByZXR1cm4gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG4gIH1cbn07XG5cbmRlZmF1bHRzLmhlYWRlcnMgPSB7XG4gIGNvbW1vbjoge1xuICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9wbGFpbiwgKi8qJ1xuICB9XG59O1xuXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHt9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHV0aWxzLm1lcmdlKERFRkFVTFRfQ09OVEVOVF9UWVBFKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJpbmQoZm4sIHRoaXNBcmcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpc0FyZywgYXJncyk7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIGVuY29kZSh2YWwpIHtcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh2YWwpLlxuICAgIHJlcGxhY2UoLyUzQS9naSwgJzonKS5cbiAgICByZXBsYWNlKC8lMjQvZywgJyQnKS5cbiAgICByZXBsYWNlKC8lMkMvZ2ksICcsJykuXG4gICAgcmVwbGFjZSgvJTIwL2csICcrJykuXG4gICAgcmVwbGFjZSgvJTVCL2dpLCAnWycpLlxuICAgIHJlcGxhY2UoLyU1RC9naSwgJ10nKTtcbn1cblxuLyoqXG4gKiBCdWlsZCBhIFVSTCBieSBhcHBlbmRpbmcgcGFyYW1zIHRvIHRoZSBlbmRcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBiYXNlIG9mIHRoZSB1cmwgKGUuZy4sIGh0dHA6Ly93d3cuZ29vZ2xlLmNvbSlcbiAqIEBwYXJhbSB7b2JqZWN0fSBbcGFyYW1zXSBUaGUgcGFyYW1zIHRvIGJlIGFwcGVuZGVkXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgZm9ybWF0dGVkIHVybFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkVVJMKHVybCwgcGFyYW1zLCBwYXJhbXNTZXJpYWxpemVyKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICBpZiAoIXBhcmFtcykge1xuICAgIHJldHVybiB1cmw7XG4gIH1cblxuICB2YXIgc2VyaWFsaXplZFBhcmFtcztcbiAgaWYgKHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zU2VyaWFsaXplcihwYXJhbXMpO1xuICB9IGVsc2UgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKHBhcmFtcykpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zLnRvU3RyaW5nKCk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHBhcnRzID0gW107XG5cbiAgICB1dGlscy5mb3JFYWNoKHBhcmFtcywgZnVuY3Rpb24gc2VyaWFsaXplKHZhbCwga2V5KSB7XG4gICAgICBpZiAodmFsID09PSBudWxsIHx8IHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHV0aWxzLmlzQXJyYXkodmFsKSkge1xuICAgICAgICBrZXkgPSBrZXkgKyAnW10nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsID0gW3ZhbF07XG4gICAgICB9XG5cbiAgICAgIHV0aWxzLmZvckVhY2godmFsLCBmdW5jdGlvbiBwYXJzZVZhbHVlKHYpIHtcbiAgICAgICAgaWYgKHV0aWxzLmlzRGF0ZSh2KSkge1xuICAgICAgICAgIHYgPSB2LnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodXRpbHMuaXNPYmplY3QodikpIHtcbiAgICAgICAgICB2ID0gSlNPTi5zdHJpbmdpZnkodik7XG4gICAgICAgIH1cbiAgICAgICAgcGFydHMucHVzaChlbmNvZGUoa2V5KSArICc9JyArIGVuY29kZSh2KSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJ0cy5qb2luKCcmJyk7XG4gIH1cblxuICBpZiAoc2VyaWFsaXplZFBhcmFtcykge1xuICAgIHZhciBoYXNobWFya0luZGV4ID0gdXJsLmluZGV4T2YoJyMnKTtcbiAgICBpZiAoaGFzaG1hcmtJbmRleCAhPT0gLTEpIHtcbiAgICAgIHVybCA9IHVybC5zbGljZSgwLCBoYXNobWFya0luZGV4KTtcbiAgICB9XG5cbiAgICB1cmwgKz0gKHVybC5pbmRleE9mKCc/JykgPT09IC0xID8gJz8nIDogJyYnKSArIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIH1cblxuICByZXR1cm4gdXJsO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIHNwZWNpZmllZCBVUkxzXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpdmVVUkwgVGhlIHJlbGF0aXZlIFVSTFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIFVSTFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlbGF0aXZlVVJMKSB7XG4gIHJldHVybiByZWxhdGl2ZVVSTFxuICAgID8gYmFzZVVSTC5yZXBsYWNlKC9cXC8rJC8sICcnKSArICcvJyArIHJlbGF0aXZlVVJMLnJlcGxhY2UoL15cXC8rLywgJycpXG4gICAgOiBiYXNlVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIHN1cHBvcnQgZG9jdW1lbnQuY29va2llXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZShuYW1lLCB2YWx1ZSwgZXhwaXJlcywgcGF0aCwgZG9tYWluLCBzZWN1cmUpIHtcbiAgICAgICAgICB2YXIgY29va2llID0gW107XG4gICAgICAgICAgY29va2llLnB1c2gobmFtZSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzTnVtYmVyKGV4cGlyZXMpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZXhwaXJlcz0nICsgbmV3IERhdGUoZXhwaXJlcykudG9HTVRTdHJpbmcoKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKHBhdGgpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgncGF0aD0nICsgcGF0aCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKGRvbWFpbikpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdkb21haW49JyArIGRvbWFpbik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNlY3VyZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3NlY3VyZScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZS5qb2luKCc7ICcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQobmFtZSkge1xuICAgICAgICAgIHZhciBtYXRjaCA9IGRvY3VtZW50LmNvb2tpZS5tYXRjaChuZXcgUmVnRXhwKCcoXnw7XFxcXHMqKSgnICsgbmFtZSArICcpPShbXjtdKiknKSk7XG4gICAgICAgICAgcmV0dXJuIChtYXRjaCA/IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaFszXSkgOiBudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZShuYW1lKSB7XG4gICAgICAgICAgdGhpcy53cml0ZShuYW1lLCAnJywgRGF0ZS5ub3coKSAtIDg2NDAwMDAwKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnYgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZSgpIHt9LFxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKCkgeyByZXR1cm4gbnVsbDsgfSxcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIFVSTCB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBYnNvbHV0ZVVSTCh1cmwpIHtcbiAgLy8gQSBVUkwgaXMgY29uc2lkZXJlZCBhYnNvbHV0ZSBpZiBpdCBiZWdpbnMgd2l0aCBcIjxzY2hlbWU+Oi8vXCIgb3IgXCIvL1wiIChwcm90b2NvbC1yZWxhdGl2ZSBVUkwpLlxuICAvLyBSRkMgMzk4NiBkZWZpbmVzIHNjaGVtZSBuYW1lIGFzIGEgc2VxdWVuY2Ugb2YgY2hhcmFjdGVycyBiZWdpbm5pbmcgd2l0aCBhIGxldHRlciBhbmQgZm9sbG93ZWRcbiAgLy8gYnkgYW55IGNvbWJpbmF0aW9uIG9mIGxldHRlcnMsIGRpZ2l0cywgcGx1cywgcGVyaW9kLCBvciBoeXBoZW4uXG4gIHJldHVybiAvXihbYS16XVthLXpcXGRcXCtcXC1cXC5dKjopP1xcL1xcLy9pLnRlc3QodXJsKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvc1xuICpcbiAqIEBwYXJhbSB7Kn0gcGF5bG9hZCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHBheWxvYWQgaXMgYW4gZXJyb3IgdGhyb3duIGJ5IEF4aW9zLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0F4aW9zRXJyb3IocGF5bG9hZCkge1xuICByZXR1cm4gKHR5cGVvZiBwYXlsb2FkID09PSAnb2JqZWN0JykgJiYgKHBheWxvYWQuaXNBeGlvc0Vycm9yID09PSB0cnVlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBoYXZlIGZ1bGwgc3VwcG9ydCBvZiB0aGUgQVBJcyBuZWVkZWQgdG8gdGVzdFxuICAvLyB3aGV0aGVyIHRoZSByZXF1ZXN0IFVSTCBpcyBvZiB0aGUgc2FtZSBvcmlnaW4gYXMgY3VycmVudCBsb2NhdGlvbi5cbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgdmFyIG1zaWUgPSAvKG1zaWV8dHJpZGVudCkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICAgICAgdmFyIHVybFBhcnNpbmdOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgdmFyIG9yaWdpblVSTDtcblxuICAgICAgLyoqXG4gICAgKiBQYXJzZSBhIFVSTCB0byBkaXNjb3ZlciBpdCdzIGNvbXBvbmVudHNcbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIFRoZSBVUkwgdG8gYmUgcGFyc2VkXG4gICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICovXG4gICAgICBmdW5jdGlvbiByZXNvbHZlVVJMKHVybCkge1xuICAgICAgICB2YXIgaHJlZiA9IHVybDtcblxuICAgICAgICBpZiAobXNpZSkge1xuICAgICAgICAvLyBJRSBuZWVkcyBhdHRyaWJ1dGUgc2V0IHR3aWNlIHRvIG5vcm1hbGl6ZSBwcm9wZXJ0aWVzXG4gICAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG4gICAgICAgICAgaHJlZiA9IHVybFBhcnNpbmdOb2RlLmhyZWY7XG4gICAgICAgIH1cblxuICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcblxuICAgICAgICAvLyB1cmxQYXJzaW5nTm9kZSBwcm92aWRlcyB0aGUgVXJsVXRpbHMgaW50ZXJmYWNlIC0gaHR0cDovL3VybC5zcGVjLndoYXR3Zy5vcmcvI3VybHV0aWxzXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaHJlZjogdXJsUGFyc2luZ05vZGUuaHJlZixcbiAgICAgICAgICBwcm90b2NvbDogdXJsUGFyc2luZ05vZGUucHJvdG9jb2wgPyB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbC5yZXBsYWNlKC86JC8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3Q6IHVybFBhcnNpbmdOb2RlLmhvc3QsXG4gICAgICAgICAgc2VhcmNoOiB1cmxQYXJzaW5nTm9kZS5zZWFyY2ggPyB1cmxQYXJzaW5nTm9kZS5zZWFyY2gucmVwbGFjZSgvXlxcPy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhhc2g6IHVybFBhcnNpbmdOb2RlLmhhc2ggPyB1cmxQYXJzaW5nTm9kZS5oYXNoLnJlcGxhY2UoL14jLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdG5hbWU6IHVybFBhcnNpbmdOb2RlLmhvc3RuYW1lLFxuICAgICAgICAgIHBvcnQ6IHVybFBhcnNpbmdOb2RlLnBvcnQsXG4gICAgICAgICAgcGF0aG5hbWU6ICh1cmxQYXJzaW5nTm9kZS5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJykgP1xuICAgICAgICAgICAgdXJsUGFyc2luZ05vZGUucGF0aG5hbWUgOlxuICAgICAgICAgICAgJy8nICsgdXJsUGFyc2luZ05vZGUucGF0aG5hbWVcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgb3JpZ2luVVJMID0gcmVzb2x2ZVVSTCh3aW5kb3cubG9jYXRpb24uaHJlZik7XG5cbiAgICAgIC8qKlxuICAgICogRGV0ZXJtaW5lIGlmIGEgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4gYXMgdGhlIGN1cnJlbnQgbG9jYXRpb25cbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gcmVxdWVzdFVSTCBUaGUgVVJMIHRvIHRlc3RcbiAgICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luLCBvdGhlcndpc2UgZmFsc2VcbiAgICAqL1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbihyZXF1ZXN0VVJMKSB7XG4gICAgICAgIHZhciBwYXJzZWQgPSAodXRpbHMuaXNTdHJpbmcocmVxdWVzdFVSTCkpID8gcmVzb2x2ZVVSTChyZXF1ZXN0VVJMKSA6IHJlcXVlc3RVUkw7XG4gICAgICAgIHJldHVybiAocGFyc2VkLnByb3RvY29sID09PSBvcmlnaW5VUkwucHJvdG9jb2wgJiZcbiAgICAgICAgICAgIHBhcnNlZC5ob3N0ID09PSBvcmlnaW5VUkwuaG9zdCk7XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudnMgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgbm9ybWFsaXplZE5hbWUpIHtcbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLCBmdW5jdGlvbiBwcm9jZXNzSGVhZGVyKHZhbHVlLCBuYW1lKSB7XG4gICAgaWYgKG5hbWUgIT09IG5vcm1hbGl6ZWROYW1lICYmIG5hbWUudG9VcHBlckNhc2UoKSA9PT0gbm9ybWFsaXplZE5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgaGVhZGVyc1tub3JtYWxpemVkTmFtZV0gPSB2YWx1ZTtcbiAgICAgIGRlbGV0ZSBoZWFkZXJzW25hbWVdO1xuICAgIH1cbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8vIEhlYWRlcnMgd2hvc2UgZHVwbGljYXRlcyBhcmUgaWdub3JlZCBieSBub2RlXG4vLyBjLmYuIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvaHR0cC5odG1sI2h0dHBfbWVzc2FnZV9oZWFkZXJzXG52YXIgaWdub3JlRHVwbGljYXRlT2YgPSBbXG4gICdhZ2UnLCAnYXV0aG9yaXphdGlvbicsICdjb250ZW50LWxlbmd0aCcsICdjb250ZW50LXR5cGUnLCAnZXRhZycsXG4gICdleHBpcmVzJywgJ2Zyb20nLCAnaG9zdCcsICdpZi1tb2RpZmllZC1zaW5jZScsICdpZi11bm1vZGlmaWVkLXNpbmNlJyxcbiAgJ2xhc3QtbW9kaWZpZWQnLCAnbG9jYXRpb24nLCAnbWF4LWZvcndhcmRzJywgJ3Byb3h5LWF1dGhvcml6YXRpb24nLFxuICAncmVmZXJlcicsICdyZXRyeS1hZnRlcicsICd1c2VyLWFnZW50J1xuXTtcblxuLyoqXG4gKiBQYXJzZSBoZWFkZXJzIGludG8gYW4gb2JqZWN0XG4gKlxuICogYGBgXG4gKiBEYXRlOiBXZWQsIDI3IEF1ZyAyMDE0IDA4OjU4OjQ5IEdNVFxuICogQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9qc29uXG4gKiBDb25uZWN0aW9uOiBrZWVwLWFsaXZlXG4gKiBUcmFuc2Zlci1FbmNvZGluZzogY2h1bmtlZFxuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGhlYWRlcnMgSGVhZGVycyBuZWVkaW5nIHRvIGJlIHBhcnNlZFxuICogQHJldHVybnMge09iamVjdH0gSGVhZGVycyBwYXJzZWQgaW50byBhbiBvYmplY3RcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZUhlYWRlcnMoaGVhZGVycykge1xuICB2YXIgcGFyc2VkID0ge307XG4gIHZhciBrZXk7XG4gIHZhciB2YWw7XG4gIHZhciBpO1xuXG4gIGlmICghaGVhZGVycykgeyByZXR1cm4gcGFyc2VkOyB9XG5cbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLnNwbGl0KCdcXG4nKSwgZnVuY3Rpb24gcGFyc2VyKGxpbmUpIHtcbiAgICBpID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAga2V5ID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cigwLCBpKSkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKGkgKyAxKSk7XG5cbiAgICBpZiAoa2V5KSB7XG4gICAgICBpZiAocGFyc2VkW2tleV0gJiYgaWdub3JlRHVwbGljYXRlT2YuaW5kZXhPZihrZXkpID49IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGtleSA9PT0gJ3NldC1jb29raWUnKSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gKHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gOiBbXSkuY29uY2F0KFt2YWxdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gcGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSArICcsICcgKyB2YWwgOiB2YWw7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcGFyc2VkO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBTeW50YWN0aWMgc3VnYXIgZm9yIGludm9raW5nIGEgZnVuY3Rpb24gYW5kIGV4cGFuZGluZyBhbiBhcnJheSBmb3IgYXJndW1lbnRzLlxuICpcbiAqIENvbW1vbiB1c2UgY2FzZSB3b3VsZCBiZSB0byB1c2UgYEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseWAuXG4gKlxuICogIGBgYGpzXG4gKiAgZnVuY3Rpb24gZih4LCB5LCB6KSB7fVxuICogIHZhciBhcmdzID0gWzEsIDIsIDNdO1xuICogIGYuYXBwbHkobnVsbCwgYXJncyk7XG4gKiAgYGBgXG4gKlxuICogV2l0aCBgc3ByZWFkYCB0aGlzIGV4YW1wbGUgY2FuIGJlIHJlLXdyaXR0ZW4uXG4gKlxuICogIGBgYGpzXG4gKiAgc3ByZWFkKGZ1bmN0aW9uKHgsIHksIHopIHt9KShbMSwgMiwgM10pO1xuICogIGBgYFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3ByZWFkKGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKGFycikge1xuICAgIHJldHVybiBjYWxsYmFjay5hcHBseShudWxsLCBhcnIpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xuXG4vKmdsb2JhbCB0b1N0cmluZzp0cnVlKi9cblxuLy8gdXRpbHMgaXMgYSBsaWJyYXJ5IG9mIGdlbmVyaWMgaGVscGVyIGZ1bmN0aW9ucyBub24tc3BlY2lmaWMgdG8gYXhpb3NcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyB1bmRlZmluZWRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdW5kZWZpbmVkLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCdWZmZXIodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbCkgJiYgdmFsLmNvbnN0cnVjdG9yICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwuY29uc3RydWN0b3IpXG4gICAgJiYgdHlwZW9mIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJyAmJiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIodmFsKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZvcm1EYXRhXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gRm9ybURhdGEsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Zvcm1EYXRhKHZhbCkge1xuICByZXR1cm4gKHR5cGVvZiBGb3JtRGF0YSAhPT0gJ3VuZGVmaW5lZCcpICYmICh2YWwgaW5zdGFuY2VvZiBGb3JtRGF0YSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlclZpZXcodmFsKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmICgodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJykgJiYgKEFycmF5QnVmZmVyLmlzVmlldykpIHtcbiAgICByZXN1bHQgPSBBcnJheUJ1ZmZlci5pc1ZpZXcodmFsKTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSAodmFsKSAmJiAodmFsLmJ1ZmZlcikgJiYgKHZhbC5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcik7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmluZ1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyaW5nLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmcodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIE51bWJlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgTnVtYmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNOdW1iZXIodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KHZhbCkge1xuICBpZiAodG9TdHJpbmcuY2FsbCh2YWwpICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsKTtcbiAgcmV0dXJuIHByb3RvdHlwZSA9PT0gbnVsbCB8fCBwcm90b3R5cGUgPT09IE9iamVjdC5wcm90b3R5cGU7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBEYXRlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBEYXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNEYXRlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGaWxlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGaWxlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGaWxlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGaWxlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCbG9iXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCbG9iLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCbG9iKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBCbG9iXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRnVuY3Rpb24sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyZWFtXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJlYW0sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmVhbSh2YWwpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHZhbCkgJiYgaXNGdW5jdGlvbih2YWwucGlwZSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVUkxTZWFyY2hQYXJhbXModmFsKSB7XG4gIHJldHVybiB0eXBlb2YgVVJMU2VhcmNoUGFyYW1zICE9PSAndW5kZWZpbmVkJyAmJiB2YWwgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXM7XG59XG5cbi8qKlxuICogVHJpbSBleGNlc3Mgd2hpdGVzcGFjZSBvZmYgdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUgU3RyaW5nIHRvIHRyaW1cbiAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBTdHJpbmcgZnJlZWQgb2YgZXhjZXNzIHdoaXRlc3BhY2VcbiAqL1xuZnVuY3Rpb24gdHJpbShzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzKi8sICcnKS5yZXBsYWNlKC9cXHMqJC8sICcnKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgd2UncmUgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnRcbiAqXG4gKiBUaGlzIGFsbG93cyBheGlvcyB0byBydW4gaW4gYSB3ZWIgd29ya2VyLCBhbmQgcmVhY3QtbmF0aXZlLlxuICogQm90aCBlbnZpcm9ubWVudHMgc3VwcG9ydCBYTUxIdHRwUmVxdWVzdCwgYnV0IG5vdCBmdWxseSBzdGFuZGFyZCBnbG9iYWxzLlxuICpcbiAqIHdlYiB3b3JrZXJzOlxuICogIHR5cGVvZiB3aW5kb3cgLT4gdW5kZWZpbmVkXG4gKiAgdHlwZW9mIGRvY3VtZW50IC0+IHVuZGVmaW5lZFxuICpcbiAqIHJlYWN0LW5hdGl2ZTpcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnUmVhY3ROYXRpdmUnXG4gKiBuYXRpdmVzY3JpcHRcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnTmF0aXZlU2NyaXB0JyBvciAnTlMnXG4gKi9cbmZ1bmN0aW9uIGlzU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgKG5hdmlnYXRvci5wcm9kdWN0ID09PSAnUmVhY3ROYXRpdmUnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOYXRpdmVTY3JpcHQnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOUycpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiAoXG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnXG4gICk7XG59XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFuIEFycmF5IG9yIGFuIE9iamVjdCBpbnZva2luZyBhIGZ1bmN0aW9uIGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgYG9iamAgaXMgYW4gQXJyYXkgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBpbmRleCwgYW5kIGNvbXBsZXRlIGFycmF5IGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgJ29iaicgaXMgYW4gT2JqZWN0IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwga2V5LCBhbmQgY29tcGxldGUgb2JqZWN0IGZvciBlYWNoIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBvYmogVGhlIG9iamVjdCB0byBpdGVyYXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIGZvciBlYWNoIGl0ZW1cbiAqL1xuZnVuY3Rpb24gZm9yRWFjaChvYmosIGZuKSB7XG4gIC8vIERvbid0IGJvdGhlciBpZiBubyB2YWx1ZSBwcm92aWRlZFxuICBpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRm9yY2UgYW4gYXJyYXkgaWYgbm90IGFscmVhZHkgc29tZXRoaW5nIGl0ZXJhYmxlXG4gIGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0Jykge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIG9iaiA9IFtvYmpdO1xuICB9XG5cbiAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBhcnJheSB2YWx1ZXNcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG9iai5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2ldLCBpLCBvYmopO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgb2JqZWN0IGtleXNcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgICBmbi5jYWxsKG51bGwsIG9ialtrZXldLCBrZXksIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQWNjZXB0cyB2YXJhcmdzIGV4cGVjdGluZyBlYWNoIGFyZ3VtZW50IHRvIGJlIGFuIG9iamVjdCwgdGhlblxuICogaW1tdXRhYmx5IG1lcmdlcyB0aGUgcHJvcGVydGllcyBvZiBlYWNoIG9iamVjdCBhbmQgcmV0dXJucyByZXN1bHQuXG4gKlxuICogV2hlbiBtdWx0aXBsZSBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUga2V5IHRoZSBsYXRlciBvYmplY3QgaW5cbiAqIHRoZSBhcmd1bWVudHMgbGlzdCB3aWxsIHRha2UgcHJlY2VkZW5jZS5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYGpzXG4gKiB2YXIgcmVzdWx0ID0gbWVyZ2Uoe2ZvbzogMTIzfSwge2ZvbzogNDU2fSk7XG4gKiBjb25zb2xlLmxvZyhyZXN1bHQuZm9vKTsgLy8gb3V0cHV0cyA0NTZcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmoxIE9iamVjdCB0byBtZXJnZVxuICogQHJldHVybnMge09iamVjdH0gUmVzdWx0IG9mIGFsbCBtZXJnZSBwcm9wZXJ0aWVzXG4gKi9cbmZ1bmN0aW9uIG1lcmdlKC8qIG9iajEsIG9iajIsIG9iajMsIC4uLiAqLykge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKGlzUGxhaW5PYmplY3QocmVzdWx0W2tleV0pICYmIGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZShyZXN1bHRba2V5XSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZSh7fSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWwuc2xpY2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWw7XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZm9yRWFjaChhcmd1bWVudHNbaV0sIGFzc2lnblZhbHVlKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEV4dGVuZHMgb2JqZWN0IGEgYnkgbXV0YWJseSBhZGRpbmcgdG8gaXQgdGhlIHByb3BlcnRpZXMgb2Ygb2JqZWN0IGIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGEgVGhlIG9iamVjdCB0byBiZSBleHRlbmRlZFxuICogQHBhcmFtIHtPYmplY3R9IGIgVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgZnJvbVxuICogQHBhcmFtIHtPYmplY3R9IHRoaXNBcmcgVGhlIG9iamVjdCB0byBiaW5kIGZ1bmN0aW9uIHRvXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSByZXN1bHRpbmcgdmFsdWUgb2Ygb2JqZWN0IGFcbiAqL1xuZnVuY3Rpb24gZXh0ZW5kKGEsIGIsIHRoaXNBcmcpIHtcbiAgZm9yRWFjaChiLCBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmICh0aGlzQXJnICYmIHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFba2V5XSA9IGJpbmQodmFsLCB0aGlzQXJnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYVtrZXldID0gdmFsO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhO1xufVxuXG4vKipcbiAqIFJlbW92ZSBieXRlIG9yZGVyIG1hcmtlci4gVGhpcyBjYXRjaGVzIEVGIEJCIEJGICh0aGUgVVRGLTggQk9NKVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50IHdpdGggQk9NXG4gKiBAcmV0dXJuIHtzdHJpbmd9IGNvbnRlbnQgdmFsdWUgd2l0aG91dCBCT01cbiAqL1xuZnVuY3Rpb24gc3RyaXBCT00oY29udGVudCkge1xuICBpZiAoY29udGVudC5jaGFyQ29kZUF0KDApID09PSAweEZFRkYpIHtcbiAgICBjb250ZW50ID0gY29udGVudC5zbGljZSgxKTtcbiAgfVxuICByZXR1cm4gY29udGVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzQXJyYXk6IGlzQXJyYXksXG4gIGlzQXJyYXlCdWZmZXI6IGlzQXJyYXlCdWZmZXIsXG4gIGlzQnVmZmVyOiBpc0J1ZmZlcixcbiAgaXNGb3JtRGF0YTogaXNGb3JtRGF0YSxcbiAgaXNBcnJheUJ1ZmZlclZpZXc6IGlzQXJyYXlCdWZmZXJWaWV3LFxuICBpc1N0cmluZzogaXNTdHJpbmcsXG4gIGlzTnVtYmVyOiBpc051bWJlcixcbiAgaXNPYmplY3Q6IGlzT2JqZWN0LFxuICBpc1BsYWluT2JqZWN0OiBpc1BsYWluT2JqZWN0LFxuICBpc1VuZGVmaW5lZDogaXNVbmRlZmluZWQsXG4gIGlzRGF0ZTogaXNEYXRlLFxuICBpc0ZpbGU6IGlzRmlsZSxcbiAgaXNCbG9iOiBpc0Jsb2IsXG4gIGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXG4gIGlzU3RyZWFtOiBpc1N0cmVhbSxcbiAgaXNVUkxTZWFyY2hQYXJhbXM6IGlzVVJMU2VhcmNoUGFyYW1zLFxuICBpc1N0YW5kYXJkQnJvd3NlckVudjogaXNTdGFuZGFyZEJyb3dzZXJFbnYsXG4gIGZvckVhY2g6IGZvckVhY2gsXG4gIG1lcmdlOiBtZXJnZSxcbiAgZXh0ZW5kOiBleHRlbmQsXG4gIHRyaW06IHRyaW0sXG4gIHN0cmlwQk9NOiBzdHJpcEJPTVxufTtcbiIsIi8qIGludGVyYWN0LmpzIDEuMTAuMTEgfCBodHRwczovL2ludGVyYWN0anMuaW8vbGljZW5zZSAqL1xuIWZ1bmN0aW9uKHQpe1wib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzJiZcInVuZGVmaW5lZFwiIT10eXBlb2YgbW9kdWxlP21vZHVsZS5leHBvcnRzPXQoKTpcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtdLHQpOihcInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93P3dpbmRvdzpcInVuZGVmaW5lZFwiIT10eXBlb2YgZ2xvYmFsP2dsb2JhbDpcInVuZGVmaW5lZFwiIT10eXBlb2Ygc2VsZj9zZWxmOnRoaXMpLmludGVyYWN0PXQoKX0oKGZ1bmN0aW9uKCl7dmFyIHQ9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5kZWZhdWx0PXZvaWQgMCx0LmRlZmF1bHQ9ZnVuY3Rpb24odCl7cmV0dXJuISghdHx8IXQuV2luZG93KSYmdCBpbnN0YW5jZW9mIHQuV2luZG93fTt2YXIgZT17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxlLmluaXQ9byxlLmdldFdpbmRvdz1mdW5jdGlvbihlKXtyZXR1cm4oMCx0LmRlZmF1bHQpKGUpP2U6KGUub3duZXJEb2N1bWVudHx8ZSkuZGVmYXVsdFZpZXd8fHIud2luZG93fSxlLndpbmRvdz1lLnJlYWxXaW5kb3c9dm9pZCAwO3ZhciBuPXZvaWQgMDtlLnJlYWxXaW5kb3c9bjt2YXIgcj12b2lkIDA7ZnVuY3Rpb24gbyh0KXtlLnJlYWxXaW5kb3c9bj10O3ZhciBvPXQuZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJcIik7by5vd25lckRvY3VtZW50IT09dC5kb2N1bWVudCYmXCJmdW5jdGlvblwiPT10eXBlb2YgdC53cmFwJiZ0LndyYXAobyk9PT1vJiYodD10LndyYXAodCkpLGUud2luZG93PXI9dH1lLndpbmRvdz1yLFwidW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3cmJndpbmRvdyYmbyh3aW5kb3cpO3ZhciBpPXt9O2Z1bmN0aW9uIGEodCl7cmV0dXJuKGE9XCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZcInN5bWJvbFwiPT10eXBlb2YgU3ltYm9sLml0ZXJhdG9yP2Z1bmN0aW9uKHQpe3JldHVybiB0eXBlb2YgdH06ZnVuY3Rpb24odCl7cmV0dXJuIHQmJlwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmdC5jb25zdHJ1Y3Rvcj09PVN5bWJvbCYmdCE9PVN5bWJvbC5wcm90b3R5cGU/XCJzeW1ib2xcIjp0eXBlb2YgdH0pKHQpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShpLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGkuZGVmYXVsdD12b2lkIDA7dmFyIHM9ZnVuY3Rpb24odCl7cmV0dXJuISF0JiZcIm9iamVjdFwiPT09YSh0KX0sbD1mdW5jdGlvbih0KXtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiB0fSx1PXt3aW5kb3c6ZnVuY3Rpb24obil7cmV0dXJuIG49PT1lLndpbmRvd3x8KDAsdC5kZWZhdWx0KShuKX0sZG9jRnJhZzpmdW5jdGlvbih0KXtyZXR1cm4gcyh0KSYmMTE9PT10Lm5vZGVUeXBlfSxvYmplY3Q6cyxmdW5jOmwsbnVtYmVyOmZ1bmN0aW9uKHQpe3JldHVyblwibnVtYmVyXCI9PXR5cGVvZiB0fSxib29sOmZ1bmN0aW9uKHQpe3JldHVyblwiYm9vbGVhblwiPT10eXBlb2YgdH0sc3RyaW5nOmZ1bmN0aW9uKHQpe3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiB0fSxlbGVtZW50OmZ1bmN0aW9uKHQpe2lmKCF0fHxcIm9iamVjdFwiIT09YSh0KSlyZXR1cm4hMTt2YXIgbj1lLmdldFdpbmRvdyh0KXx8ZS53aW5kb3c7cmV0dXJuL29iamVjdHxmdW5jdGlvbi8udGVzdChhKG4uRWxlbWVudCkpP3QgaW5zdGFuY2VvZiBuLkVsZW1lbnQ6MT09PXQubm9kZVR5cGUmJlwic3RyaW5nXCI9PXR5cGVvZiB0Lm5vZGVOYW1lfSxwbGFpbk9iamVjdDpmdW5jdGlvbih0KXtyZXR1cm4gcyh0KSYmISF0LmNvbnN0cnVjdG9yJiYvZnVuY3Rpb24gT2JqZWN0XFxiLy50ZXN0KHQuY29uc3RydWN0b3IudG9TdHJpbmcoKSl9LGFycmF5OmZ1bmN0aW9uKHQpe3JldHVybiBzKHQpJiZ2b2lkIDAhPT10Lmxlbmd0aCYmbCh0LnNwbGljZSl9fTtpLmRlZmF1bHQ9dTt2YXIgYz17fTtmdW5jdGlvbiBmKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb247aWYoXCJkcmFnXCI9PT1lLnByZXBhcmVkLm5hbWUpe3ZhciBuPWUucHJlcGFyZWQuYXhpcztcInhcIj09PW4/KGUuY29vcmRzLmN1ci5wYWdlLnk9ZS5jb29yZHMuc3RhcnQucGFnZS55LGUuY29vcmRzLmN1ci5jbGllbnQueT1lLmNvb3Jkcy5zdGFydC5jbGllbnQueSxlLmNvb3Jkcy52ZWxvY2l0eS5jbGllbnQueT0wLGUuY29vcmRzLnZlbG9jaXR5LnBhZ2UueT0wKTpcInlcIj09PW4mJihlLmNvb3Jkcy5jdXIucGFnZS54PWUuY29vcmRzLnN0YXJ0LnBhZ2UueCxlLmNvb3Jkcy5jdXIuY2xpZW50Lng9ZS5jb29yZHMuc3RhcnQuY2xpZW50LngsZS5jb29yZHMudmVsb2NpdHkuY2xpZW50Lng9MCxlLmNvb3Jkcy52ZWxvY2l0eS5wYWdlLng9MCl9fWZ1bmN0aW9uIGQodCl7dmFyIGU9dC5pRXZlbnQsbj10LmludGVyYWN0aW9uO2lmKFwiZHJhZ1wiPT09bi5wcmVwYXJlZC5uYW1lKXt2YXIgcj1uLnByZXBhcmVkLmF4aXM7aWYoXCJ4XCI9PT1yfHxcInlcIj09PXIpe3ZhciBvPVwieFwiPT09cj9cInlcIjpcInhcIjtlLnBhZ2Vbb109bi5jb29yZHMuc3RhcnQucGFnZVtvXSxlLmNsaWVudFtvXT1uLmNvb3Jkcy5zdGFydC5jbGllbnRbb10sZS5kZWx0YVtvXT0wfX19T2JqZWN0LmRlZmluZVByb3BlcnR5KGMsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksYy5kZWZhdWx0PXZvaWQgMDt2YXIgcD17aWQ6XCJhY3Rpb25zL2RyYWdcIixpbnN0YWxsOmZ1bmN0aW9uKHQpe3ZhciBlPXQuYWN0aW9ucyxuPXQuSW50ZXJhY3RhYmxlLHI9dC5kZWZhdWx0cztuLnByb3RvdHlwZS5kcmFnZ2FibGU9cC5kcmFnZ2FibGUsZS5tYXAuZHJhZz1wLGUubWV0aG9kRGljdC5kcmFnPVwiZHJhZ2dhYmxlXCIsci5hY3Rpb25zLmRyYWc9cC5kZWZhdWx0c30sbGlzdGVuZXJzOntcImludGVyYWN0aW9uczpiZWZvcmUtYWN0aW9uLW1vdmVcIjpmLFwiaW50ZXJhY3Rpb25zOmFjdGlvbi1yZXN1bWVcIjpmLFwiaW50ZXJhY3Rpb25zOmFjdGlvbi1tb3ZlXCI6ZCxcImF1dG8tc3RhcnQ6Y2hlY2tcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uLG49dC5pbnRlcmFjdGFibGUscj10LmJ1dHRvbnMsbz1uLm9wdGlvbnMuZHJhZztpZihvJiZvLmVuYWJsZWQmJighZS5wb2ludGVySXNEb3dufHwhL21vdXNlfHBvaW50ZXIvLnRlc3QoZS5wb2ludGVyVHlwZSl8fDAhPShyJm4ub3B0aW9ucy5kcmFnLm1vdXNlQnV0dG9ucykpKXJldHVybiB0LmFjdGlvbj17bmFtZTpcImRyYWdcIixheGlzOlwic3RhcnRcIj09PW8ubG9ja0F4aXM/by5zdGFydEF4aXM6by5sb2NrQXhpc30sITF9fSxkcmFnZ2FibGU6ZnVuY3Rpb24odCl7cmV0dXJuIGkuZGVmYXVsdC5vYmplY3QodCk/KHRoaXMub3B0aW9ucy5kcmFnLmVuYWJsZWQ9ITEhPT10LmVuYWJsZWQsdGhpcy5zZXRQZXJBY3Rpb24oXCJkcmFnXCIsdCksdGhpcy5zZXRPbkV2ZW50cyhcImRyYWdcIix0KSwvXih4eXx4fHl8c3RhcnQpJC8udGVzdCh0LmxvY2tBeGlzKSYmKHRoaXMub3B0aW9ucy5kcmFnLmxvY2tBeGlzPXQubG9ja0F4aXMpLC9eKHh5fHh8eSkkLy50ZXN0KHQuc3RhcnRBeGlzKSYmKHRoaXMub3B0aW9ucy5kcmFnLnN0YXJ0QXhpcz10LnN0YXJ0QXhpcyksdGhpcyk6aS5kZWZhdWx0LmJvb2wodCk/KHRoaXMub3B0aW9ucy5kcmFnLmVuYWJsZWQ9dCx0aGlzKTp0aGlzLm9wdGlvbnMuZHJhZ30sYmVmb3JlTW92ZTpmLG1vdmU6ZCxkZWZhdWx0czp7c3RhcnRBeGlzOlwieHlcIixsb2NrQXhpczpcInh5XCJ9LGdldEN1cnNvcjpmdW5jdGlvbigpe3JldHVyblwibW92ZVwifX0sdj1wO2MuZGVmYXVsdD12O3ZhciBoPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShoLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGguZGVmYXVsdD12b2lkIDA7dmFyIGc9e2luaXQ6ZnVuY3Rpb24odCl7dmFyIGU9dDtnLmRvY3VtZW50PWUuZG9jdW1lbnQsZy5Eb2N1bWVudEZyYWdtZW50PWUuRG9jdW1lbnRGcmFnbWVudHx8eSxnLlNWR0VsZW1lbnQ9ZS5TVkdFbGVtZW50fHx5LGcuU1ZHU1ZHRWxlbWVudD1lLlNWR1NWR0VsZW1lbnR8fHksZy5TVkdFbGVtZW50SW5zdGFuY2U9ZS5TVkdFbGVtZW50SW5zdGFuY2V8fHksZy5FbGVtZW50PWUuRWxlbWVudHx8eSxnLkhUTUxFbGVtZW50PWUuSFRNTEVsZW1lbnR8fGcuRWxlbWVudCxnLkV2ZW50PWUuRXZlbnQsZy5Ub3VjaD1lLlRvdWNofHx5LGcuUG9pbnRlckV2ZW50PWUuUG9pbnRlckV2ZW50fHxlLk1TUG9pbnRlckV2ZW50fSxkb2N1bWVudDpudWxsLERvY3VtZW50RnJhZ21lbnQ6bnVsbCxTVkdFbGVtZW50Om51bGwsU1ZHU1ZHRWxlbWVudDpudWxsLFNWR0VsZW1lbnRJbnN0YW5jZTpudWxsLEVsZW1lbnQ6bnVsbCxIVE1MRWxlbWVudDpudWxsLEV2ZW50Om51bGwsVG91Y2g6bnVsbCxQb2ludGVyRXZlbnQ6bnVsbH07ZnVuY3Rpb24geSgpe312YXIgbT1nO2guZGVmYXVsdD1tO3ZhciBiPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShiLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGIuZGVmYXVsdD12b2lkIDA7dmFyIHg9e2luaXQ6ZnVuY3Rpb24odCl7dmFyIGU9aC5kZWZhdWx0LkVsZW1lbnQsbj10Lm5hdmlnYXRvcnx8e307eC5zdXBwb3J0c1RvdWNoPVwib250b3VjaHN0YXJ0XCJpbiB0fHxpLmRlZmF1bHQuZnVuYyh0LkRvY3VtZW50VG91Y2gpJiZoLmRlZmF1bHQuZG9jdW1lbnQgaW5zdGFuY2VvZiB0LkRvY3VtZW50VG91Y2gseC5zdXBwb3J0c1BvaW50ZXJFdmVudD0hMSE9PW4ucG9pbnRlckVuYWJsZWQmJiEhaC5kZWZhdWx0LlBvaW50ZXJFdmVudCx4LmlzSU9TPS9pUChob25lfG9kfGFkKS8udGVzdChuLnBsYXRmb3JtKSx4LmlzSU9TNz0vaVAoaG9uZXxvZHxhZCkvLnRlc3Qobi5wbGF0Zm9ybSkmJi9PUyA3W15cXGRdLy50ZXN0KG4uYXBwVmVyc2lvbikseC5pc0llOT0vTVNJRSA5Ly50ZXN0KG4udXNlckFnZW50KSx4LmlzT3BlcmFNb2JpbGU9XCJPcGVyYVwiPT09bi5hcHBOYW1lJiZ4LnN1cHBvcnRzVG91Y2gmJi9QcmVzdG8vLnRlc3Qobi51c2VyQWdlbnQpLHgucHJlZml4ZWRNYXRjaGVzU2VsZWN0b3I9XCJtYXRjaGVzXCJpbiBlLnByb3RvdHlwZT9cIm1hdGNoZXNcIjpcIndlYmtpdE1hdGNoZXNTZWxlY3RvclwiaW4gZS5wcm90b3R5cGU/XCJ3ZWJraXRNYXRjaGVzU2VsZWN0b3JcIjpcIm1vek1hdGNoZXNTZWxlY3RvclwiaW4gZS5wcm90b3R5cGU/XCJtb3pNYXRjaGVzU2VsZWN0b3JcIjpcIm9NYXRjaGVzU2VsZWN0b3JcImluIGUucHJvdG90eXBlP1wib01hdGNoZXNTZWxlY3RvclwiOlwibXNNYXRjaGVzU2VsZWN0b3JcIix4LnBFdmVudFR5cGVzPXguc3VwcG9ydHNQb2ludGVyRXZlbnQ/aC5kZWZhdWx0LlBvaW50ZXJFdmVudD09PXQuTVNQb2ludGVyRXZlbnQ/e3VwOlwiTVNQb2ludGVyVXBcIixkb3duOlwiTVNQb2ludGVyRG93blwiLG92ZXI6XCJtb3VzZW92ZXJcIixvdXQ6XCJtb3VzZW91dFwiLG1vdmU6XCJNU1BvaW50ZXJNb3ZlXCIsY2FuY2VsOlwiTVNQb2ludGVyQ2FuY2VsXCJ9Ont1cDpcInBvaW50ZXJ1cFwiLGRvd246XCJwb2ludGVyZG93blwiLG92ZXI6XCJwb2ludGVyb3ZlclwiLG91dDpcInBvaW50ZXJvdXRcIixtb3ZlOlwicG9pbnRlcm1vdmVcIixjYW5jZWw6XCJwb2ludGVyY2FuY2VsXCJ9Om51bGwseC53aGVlbEV2ZW50PWguZGVmYXVsdC5kb2N1bWVudCYmXCJvbm1vdXNld2hlZWxcImluIGguZGVmYXVsdC5kb2N1bWVudD9cIm1vdXNld2hlZWxcIjpcIndoZWVsXCJ9LHN1cHBvcnRzVG91Y2g6bnVsbCxzdXBwb3J0c1BvaW50ZXJFdmVudDpudWxsLGlzSU9TNzpudWxsLGlzSU9TOm51bGwsaXNJZTk6bnVsbCxpc09wZXJhTW9iaWxlOm51bGwscHJlZml4ZWRNYXRjaGVzU2VsZWN0b3I6bnVsbCxwRXZlbnRUeXBlczpudWxsLHdoZWVsRXZlbnQ6bnVsbH0sdz14O2IuZGVmYXVsdD13O3ZhciBfPXt9O2Z1bmN0aW9uIFAodCl7dmFyIGU9dC5wYXJlbnROb2RlO2lmKGkuZGVmYXVsdC5kb2NGcmFnKGUpKXtmb3IoOyhlPWUuaG9zdCkmJmkuZGVmYXVsdC5kb2NGcmFnKGUpOyk7cmV0dXJuIGV9cmV0dXJuIGV9ZnVuY3Rpb24gTyh0LG4pe3JldHVybiBlLndpbmRvdyE9PWUucmVhbFdpbmRvdyYmKG49bi5yZXBsYWNlKC9cXC9kZWVwXFwvL2csXCIgXCIpKSx0W2IuZGVmYXVsdC5wcmVmaXhlZE1hdGNoZXNTZWxlY3Rvcl0obil9T2JqZWN0LmRlZmluZVByb3BlcnR5KF8sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksXy5ub2RlQ29udGFpbnM9ZnVuY3Rpb24odCxlKXtpZih0LmNvbnRhaW5zKXJldHVybiB0LmNvbnRhaW5zKGUpO2Zvcig7ZTspe2lmKGU9PT10KXJldHVybiEwO2U9ZS5wYXJlbnROb2RlfXJldHVybiExfSxfLmNsb3Nlc3Q9ZnVuY3Rpb24odCxlKXtmb3IoO2kuZGVmYXVsdC5lbGVtZW50KHQpOyl7aWYoTyh0LGUpKXJldHVybiB0O3Q9UCh0KX1yZXR1cm4gbnVsbH0sXy5wYXJlbnROb2RlPVAsXy5tYXRjaGVzU2VsZWN0b3I9TyxfLmluZGV4T2ZEZWVwZXN0RWxlbWVudD1mdW5jdGlvbih0KXtmb3IodmFyIG4scj1bXSxvPTA7bzx0Lmxlbmd0aDtvKyspe3ZhciBpPXRbb10sYT10W25dO2lmKGkmJm8hPT1uKWlmKGEpe3ZhciBzPVMoaSksbD1TKGEpO2lmKHMhPT1pLm93bmVyRG9jdW1lbnQpaWYobCE9PWkub3duZXJEb2N1bWVudClpZihzIT09bCl7cj1yLmxlbmd0aD9yOkUoYSk7dmFyIHU9dm9pZCAwO2lmKGEgaW5zdGFuY2VvZiBoLmRlZmF1bHQuSFRNTEVsZW1lbnQmJmkgaW5zdGFuY2VvZiBoLmRlZmF1bHQuU1ZHRWxlbWVudCYmIShpIGluc3RhbmNlb2YgaC5kZWZhdWx0LlNWR1NWR0VsZW1lbnQpKXtpZihpPT09bCljb250aW51ZTt1PWkub3duZXJTVkdFbGVtZW50fWVsc2UgdT1pO2Zvcih2YXIgYz1FKHUsYS5vd25lckRvY3VtZW50KSxmPTA7Y1tmXSYmY1tmXT09PXJbZl07KWYrKzt2YXIgZD1bY1tmLTFdLGNbZl0scltmXV07aWYoZFswXSlmb3IodmFyIHA9ZFswXS5sYXN0Q2hpbGQ7cDspe2lmKHA9PT1kWzFdKXtuPW8scj1jO2JyZWFrfWlmKHA9PT1kWzJdKWJyZWFrO3A9cC5wcmV2aW91c1NpYmxpbmd9fWVsc2Ugdj1pLGc9YSx2b2lkIDAsdm9pZCAwLChwYXJzZUludChlLmdldFdpbmRvdyh2KS5nZXRDb21wdXRlZFN0eWxlKHYpLnpJbmRleCwxMCl8fDApPj0ocGFyc2VJbnQoZS5nZXRXaW5kb3coZykuZ2V0Q29tcHV0ZWRTdHlsZShnKS56SW5kZXgsMTApfHwwKSYmKG49byk7ZWxzZSBuPW99ZWxzZSBuPW99dmFyIHYsZztyZXR1cm4gbn0sXy5tYXRjaGVzVXBUbz1mdW5jdGlvbih0LGUsbil7Zm9yKDtpLmRlZmF1bHQuZWxlbWVudCh0KTspe2lmKE8odCxlKSlyZXR1cm4hMDtpZigodD1QKHQpKT09PW4pcmV0dXJuIE8odCxlKX1yZXR1cm4hMX0sXy5nZXRBY3R1YWxFbGVtZW50PWZ1bmN0aW9uKHQpe3JldHVybiB0LmNvcnJlc3BvbmRpbmdVc2VFbGVtZW50fHx0fSxfLmdldFNjcm9sbFhZPVQsXy5nZXRFbGVtZW50Q2xpZW50UmVjdD1NLF8uZ2V0RWxlbWVudFJlY3Q9ZnVuY3Rpb24odCl7dmFyIG49TSh0KTtpZighYi5kZWZhdWx0LmlzSU9TNyYmbil7dmFyIHI9VChlLmdldFdpbmRvdyh0KSk7bi5sZWZ0Kz1yLngsbi5yaWdodCs9ci54LG4udG9wKz1yLnksbi5ib3R0b20rPXIueX1yZXR1cm4gbn0sXy5nZXRQYXRoPWZ1bmN0aW9uKHQpe2Zvcih2YXIgZT1bXTt0OyllLnB1c2godCksdD1QKHQpO3JldHVybiBlfSxfLnRyeVNlbGVjdG9yPWZ1bmN0aW9uKHQpe3JldHVybiEhaS5kZWZhdWx0LnN0cmluZyh0KSYmKGguZGVmYXVsdC5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHQpLCEwKX07dmFyIFM9ZnVuY3Rpb24odCl7cmV0dXJuIHQucGFyZW50Tm9kZXx8dC5ob3N0fTtmdW5jdGlvbiBFKHQsZSl7Zm9yKHZhciBuLHI9W10sbz10OyhuPVMobykpJiZvIT09ZSYmbiE9PW8ub3duZXJEb2N1bWVudDspci51bnNoaWZ0KG8pLG89bjtyZXR1cm4gcn1mdW5jdGlvbiBUKHQpe3JldHVybnt4Oih0PXR8fGUud2luZG93KS5zY3JvbGxYfHx0LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0LHk6dC5zY3JvbGxZfHx0LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3B9fWZ1bmN0aW9uIE0odCl7dmFyIGU9dCBpbnN0YW5jZW9mIGguZGVmYXVsdC5TVkdFbGVtZW50P3QuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk6dC5nZXRDbGllbnRSZWN0cygpWzBdO3JldHVybiBlJiZ7bGVmdDplLmxlZnQscmlnaHQ6ZS5yaWdodCx0b3A6ZS50b3AsYm90dG9tOmUuYm90dG9tLHdpZHRoOmUud2lkdGh8fGUucmlnaHQtZS5sZWZ0LGhlaWdodDplLmhlaWdodHx8ZS5ib3R0b20tZS50b3B9fXZhciBqPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShqLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGouZGVmYXVsdD1mdW5jdGlvbih0LGUpe2Zvcih2YXIgbiBpbiBlKXRbbl09ZVtuXTtyZXR1cm4gdH07dmFyIGs9e307ZnVuY3Rpb24gSSh0LGUpeyhudWxsPT1lfHxlPnQubGVuZ3RoKSYmKGU9dC5sZW5ndGgpO2Zvcih2YXIgbj0wLHI9QXJyYXkoZSk7bjxlO24rKylyW25dPXRbbl07cmV0dXJuIHJ9ZnVuY3Rpb24gRCh0LGUsbil7cmV0dXJuXCJwYXJlbnRcIj09PXQ/KDAsXy5wYXJlbnROb2RlKShuKTpcInNlbGZcIj09PXQ/ZS5nZXRSZWN0KG4pOigwLF8uY2xvc2VzdCkobix0KX1PYmplY3QuZGVmaW5lUHJvcGVydHkoayxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxrLmdldFN0cmluZ09wdGlvblJlc3VsdD1ELGsucmVzb2x2ZVJlY3RMaWtlPWZ1bmN0aW9uKHQsZSxuLHIpe3ZhciBvLGE9dDtyZXR1cm4gaS5kZWZhdWx0LnN0cmluZyhhKT9hPUQoYSxlLG4pOmkuZGVmYXVsdC5mdW5jKGEpJiYoYT1hLmFwcGx5KHZvaWQgMCxmdW5jdGlvbih0KXtpZihBcnJheS5pc0FycmF5KHQpKXJldHVybiBJKHQpfShvPXIpfHxmdW5jdGlvbih0KXtpZihcInVuZGVmaW5lZFwiIT10eXBlb2YgU3ltYm9sJiZTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KHQpKXJldHVybiBBcnJheS5mcm9tKHQpfShvKXx8ZnVuY3Rpb24odCxlKXtpZih0KXtpZihcInN0cmluZ1wiPT10eXBlb2YgdClyZXR1cm4gSSh0LGUpO3ZhciBuPU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0KS5zbGljZSg4LC0xKTtyZXR1cm5cIk9iamVjdFwiPT09biYmdC5jb25zdHJ1Y3RvciYmKG49dC5jb25zdHJ1Y3Rvci5uYW1lKSxcIk1hcFwiPT09bnx8XCJTZXRcIj09PW4/QXJyYXkuZnJvbSh0KTpcIkFyZ3VtZW50c1wiPT09bnx8L14oPzpVaXxJKW50KD86OHwxNnwzMikoPzpDbGFtcGVkKT9BcnJheSQvLnRlc3Qobik/SSh0LGUpOnZvaWQgMH19KG8pfHxmdW5jdGlvbigpe3Rocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gc3ByZWFkIG5vbi1pdGVyYWJsZSBpbnN0YW5jZS5cXG5JbiBvcmRlciB0byBiZSBpdGVyYWJsZSwgbm9uLWFycmF5IG9iamVjdHMgbXVzdCBoYXZlIGEgW1N5bWJvbC5pdGVyYXRvcl0oKSBtZXRob2QuXCIpfSgpKSksaS5kZWZhdWx0LmVsZW1lbnQoYSkmJihhPSgwLF8uZ2V0RWxlbWVudFJlY3QpKGEpKSxhfSxrLnJlY3RUb1hZPWZ1bmN0aW9uKHQpe3JldHVybiB0JiZ7eDpcInhcImluIHQ/dC54OnQubGVmdCx5OlwieVwiaW4gdD90Lnk6dC50b3B9fSxrLnh5d2hUb1RsYnI9ZnVuY3Rpb24odCl7cmV0dXJuIXR8fFwibGVmdFwiaW4gdCYmXCJ0b3BcImluIHR8fCgodD0oMCxqLmRlZmF1bHQpKHt9LHQpKS5sZWZ0PXQueHx8MCx0LnRvcD10Lnl8fDAsdC5yaWdodD10LnJpZ2h0fHx0LmxlZnQrdC53aWR0aCx0LmJvdHRvbT10LmJvdHRvbXx8dC50b3ArdC5oZWlnaHQpLHR9LGsudGxiclRvWHl3aD1mdW5jdGlvbih0KXtyZXR1cm4hdHx8XCJ4XCJpbiB0JiZcInlcImluIHR8fCgodD0oMCxqLmRlZmF1bHQpKHt9LHQpKS54PXQubGVmdHx8MCx0Lnk9dC50b3B8fDAsdC53aWR0aD10LndpZHRofHwodC5yaWdodHx8MCktdC54LHQuaGVpZ2h0PXQuaGVpZ2h0fHwodC5ib3R0b218fDApLXQueSksdH0say5hZGRFZGdlcz1mdW5jdGlvbih0LGUsbil7dC5sZWZ0JiYoZS5sZWZ0Kz1uLngpLHQucmlnaHQmJihlLnJpZ2h0Kz1uLngpLHQudG9wJiYoZS50b3ArPW4ueSksdC5ib3R0b20mJihlLmJvdHRvbSs9bi55KSxlLndpZHRoPWUucmlnaHQtZS5sZWZ0LGUuaGVpZ2h0PWUuYm90dG9tLWUudG9wfTt2YXIgQT17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoQSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxBLmRlZmF1bHQ9ZnVuY3Rpb24odCxlLG4pe3ZhciByPXQub3B0aW9uc1tuXSxvPXImJnIub3JpZ2lufHx0Lm9wdGlvbnMub3JpZ2luLGk9KDAsay5yZXNvbHZlUmVjdExpa2UpKG8sdCxlLFt0JiZlXSk7cmV0dXJuKDAsay5yZWN0VG9YWSkoaSl8fHt4OjAseTowfX07dmFyIFI9e307ZnVuY3Rpb24geih0KXtyZXR1cm4gdC50cmltKCkuc3BsaXQoLyArLyl9T2JqZWN0LmRlZmluZVByb3BlcnR5KFIsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksUi5kZWZhdWx0PWZ1bmN0aW9uIHQoZSxuLHIpe2lmKHI9cnx8e30saS5kZWZhdWx0LnN0cmluZyhlKSYmLTEhPT1lLnNlYXJjaChcIiBcIikmJihlPXooZSkpLGkuZGVmYXVsdC5hcnJheShlKSlyZXR1cm4gZS5yZWR1Y2UoKGZ1bmN0aW9uKGUsbyl7cmV0dXJuKDAsai5kZWZhdWx0KShlLHQobyxuLHIpKX0pLHIpO2lmKGkuZGVmYXVsdC5vYmplY3QoZSkmJihuPWUsZT1cIlwiKSxpLmRlZmF1bHQuZnVuYyhuKSlyW2VdPXJbZV18fFtdLHJbZV0ucHVzaChuKTtlbHNlIGlmKGkuZGVmYXVsdC5hcnJheShuKSlmb3IodmFyIG89MDtvPG4ubGVuZ3RoO28rKyl7dmFyIGE7YT1uW29dLHQoZSxhLHIpfWVsc2UgaWYoaS5kZWZhdWx0Lm9iamVjdChuKSlmb3IodmFyIHMgaW4gbil7dmFyIGw9eihzKS5tYXAoKGZ1bmN0aW9uKHQpe3JldHVyblwiXCIuY29uY2F0KGUpLmNvbmNhdCh0KX0pKTt0KGwsbltzXSxyKX1yZXR1cm4gcn07dmFyIEM9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KEMsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksQy5kZWZhdWx0PXZvaWQgMCxDLmRlZmF1bHQ9ZnVuY3Rpb24odCxlKXtyZXR1cm4gTWF0aC5zcXJ0KHQqdCtlKmUpfTt2YXIgRj17fTtmdW5jdGlvbiBYKHQsZSl7Zm9yKHZhciBuIGluIGUpe3ZhciByPVgucHJlZml4ZWRQcm9wUkVzLG89ITE7Zm9yKHZhciBpIGluIHIpaWYoMD09PW4uaW5kZXhPZihpKSYmcltpXS50ZXN0KG4pKXtvPSEwO2JyZWFrfW98fFwiZnVuY3Rpb25cIj09dHlwZW9mIGVbbl18fCh0W25dPWVbbl0pfXJldHVybiB0fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShGLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLEYuZGVmYXVsdD12b2lkIDAsWC5wcmVmaXhlZFByb3BSRXM9e3dlYmtpdDovKE1vdmVtZW50W1hZXXxSYWRpdXNbWFldfFJvdGF0aW9uQW5nbGV8Rm9yY2UpJC8sbW96Oi8oUHJlc3N1cmUpJC99O3ZhciBZPVg7Ri5kZWZhdWx0PVk7dmFyIEI9e307ZnVuY3Rpb24gVyh0KXtyZXR1cm4gdCBpbnN0YW5jZW9mIGguZGVmYXVsdC5FdmVudHx8dCBpbnN0YW5jZW9mIGguZGVmYXVsdC5Ub3VjaH1mdW5jdGlvbiBMKHQsZSxuKXtyZXR1cm4gdD10fHxcInBhZ2VcIiwobj1ufHx7fSkueD1lW3QrXCJYXCJdLG4ueT1lW3QrXCJZXCJdLG59ZnVuY3Rpb24gVSh0LGUpe3JldHVybiBlPWV8fHt4OjAseTowfSxiLmRlZmF1bHQuaXNPcGVyYU1vYmlsZSYmVyh0KT8oTChcInNjcmVlblwiLHQsZSksZS54Kz13aW5kb3cuc2Nyb2xsWCxlLnkrPXdpbmRvdy5zY3JvbGxZKTpMKFwicGFnZVwiLHQsZSksZX1mdW5jdGlvbiBWKHQsZSl7cmV0dXJuIGU9ZXx8e30sYi5kZWZhdWx0LmlzT3BlcmFNb2JpbGUmJlcodCk/TChcInNjcmVlblwiLHQsZSk6TChcImNsaWVudFwiLHQsZSksZX1mdW5jdGlvbiBOKHQpe3ZhciBlPVtdO3JldHVybiBpLmRlZmF1bHQuYXJyYXkodCk/KGVbMF09dFswXSxlWzFdPXRbMV0pOlwidG91Y2hlbmRcIj09PXQudHlwZT8xPT09dC50b3VjaGVzLmxlbmd0aD8oZVswXT10LnRvdWNoZXNbMF0sZVsxXT10LmNoYW5nZWRUb3VjaGVzWzBdKTowPT09dC50b3VjaGVzLmxlbmd0aCYmKGVbMF09dC5jaGFuZ2VkVG91Y2hlc1swXSxlWzFdPXQuY2hhbmdlZFRvdWNoZXNbMV0pOihlWzBdPXQudG91Y2hlc1swXSxlWzFdPXQudG91Y2hlc1sxXSksZX1mdW5jdGlvbiBxKHQpe2Zvcih2YXIgZT17cGFnZVg6MCxwYWdlWTowLGNsaWVudFg6MCxjbGllbnRZOjAsc2NyZWVuWDowLHNjcmVlblk6MH0sbj0wO248dC5sZW5ndGg7bisrKXt2YXIgcj10W25dO2Zvcih2YXIgbyBpbiBlKWVbb10rPXJbb119Zm9yKHZhciBpIGluIGUpZVtpXS89dC5sZW5ndGg7cmV0dXJuIGV9T2JqZWN0LmRlZmluZVByb3BlcnR5KEIsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksQi5jb3B5Q29vcmRzPWZ1bmN0aW9uKHQsZSl7dC5wYWdlPXQucGFnZXx8e30sdC5wYWdlLng9ZS5wYWdlLngsdC5wYWdlLnk9ZS5wYWdlLnksdC5jbGllbnQ9dC5jbGllbnR8fHt9LHQuY2xpZW50Lng9ZS5jbGllbnQueCx0LmNsaWVudC55PWUuY2xpZW50LnksdC50aW1lU3RhbXA9ZS50aW1lU3RhbXB9LEIuc2V0Q29vcmREZWx0YXM9ZnVuY3Rpb24odCxlLG4pe3QucGFnZS54PW4ucGFnZS54LWUucGFnZS54LHQucGFnZS55PW4ucGFnZS55LWUucGFnZS55LHQuY2xpZW50Lng9bi5jbGllbnQueC1lLmNsaWVudC54LHQuY2xpZW50Lnk9bi5jbGllbnQueS1lLmNsaWVudC55LHQudGltZVN0YW1wPW4udGltZVN0YW1wLWUudGltZVN0YW1wfSxCLnNldENvb3JkVmVsb2NpdHk9ZnVuY3Rpb24odCxlKXt2YXIgbj1NYXRoLm1heChlLnRpbWVTdGFtcC8xZTMsLjAwMSk7dC5wYWdlLng9ZS5wYWdlLngvbix0LnBhZ2UueT1lLnBhZ2UueS9uLHQuY2xpZW50Lng9ZS5jbGllbnQueC9uLHQuY2xpZW50Lnk9ZS5jbGllbnQueS9uLHQudGltZVN0YW1wPW59LEIuc2V0WmVyb0Nvb3Jkcz1mdW5jdGlvbih0KXt0LnBhZ2UueD0wLHQucGFnZS55PTAsdC5jbGllbnQueD0wLHQuY2xpZW50Lnk9MH0sQi5pc05hdGl2ZVBvaW50ZXI9VyxCLmdldFhZPUwsQi5nZXRQYWdlWFk9VSxCLmdldENsaWVudFhZPVYsQi5nZXRQb2ludGVySWQ9ZnVuY3Rpb24odCl7cmV0dXJuIGkuZGVmYXVsdC5udW1iZXIodC5wb2ludGVySWQpP3QucG9pbnRlcklkOnQuaWRlbnRpZmllcn0sQi5zZXRDb29yZHM9ZnVuY3Rpb24odCxlLG4pe3ZhciByPWUubGVuZ3RoPjE/cShlKTplWzBdO1Uocix0LnBhZ2UpLFYocix0LmNsaWVudCksdC50aW1lU3RhbXA9bn0sQi5nZXRUb3VjaFBhaXI9TixCLnBvaW50ZXJBdmVyYWdlPXEsQi50b3VjaEJCb3g9ZnVuY3Rpb24odCl7aWYoIXQubGVuZ3RoKXJldHVybiBudWxsO3ZhciBlPU4odCksbj1NYXRoLm1pbihlWzBdLnBhZ2VYLGVbMV0ucGFnZVgpLHI9TWF0aC5taW4oZVswXS5wYWdlWSxlWzFdLnBhZ2VZKSxvPU1hdGgubWF4KGVbMF0ucGFnZVgsZVsxXS5wYWdlWCksaT1NYXRoLm1heChlWzBdLnBhZ2VZLGVbMV0ucGFnZVkpO3JldHVybnt4Om4seTpyLGxlZnQ6bix0b3A6cixyaWdodDpvLGJvdHRvbTppLHdpZHRoOm8tbixoZWlnaHQ6aS1yfX0sQi50b3VjaERpc3RhbmNlPWZ1bmN0aW9uKHQsZSl7dmFyIG49ZStcIlhcIixyPWUrXCJZXCIsbz1OKHQpLGk9b1swXVtuXS1vWzFdW25dLGE9b1swXVtyXS1vWzFdW3JdO3JldHVybigwLEMuZGVmYXVsdCkoaSxhKX0sQi50b3VjaEFuZ2xlPWZ1bmN0aW9uKHQsZSl7dmFyIG49ZStcIlhcIixyPWUrXCJZXCIsbz1OKHQpLGk9b1sxXVtuXS1vWzBdW25dLGE9b1sxXVtyXS1vWzBdW3JdO3JldHVybiAxODAqTWF0aC5hdGFuMihhLGkpL01hdGguUEl9LEIuZ2V0UG9pbnRlclR5cGU9ZnVuY3Rpb24odCl7cmV0dXJuIGkuZGVmYXVsdC5zdHJpbmcodC5wb2ludGVyVHlwZSk/dC5wb2ludGVyVHlwZTppLmRlZmF1bHQubnVtYmVyKHQucG9pbnRlclR5cGUpP1t2b2lkIDAsdm9pZCAwLFwidG91Y2hcIixcInBlblwiLFwibW91c2VcIl1bdC5wb2ludGVyVHlwZV06L3RvdWNoLy50ZXN0KHQudHlwZXx8XCJcIil8fHQgaW5zdGFuY2VvZiBoLmRlZmF1bHQuVG91Y2g/XCJ0b3VjaFwiOlwibW91c2VcIn0sQi5nZXRFdmVudFRhcmdldHM9ZnVuY3Rpb24odCl7dmFyIGU9aS5kZWZhdWx0LmZ1bmModC5jb21wb3NlZFBhdGgpP3QuY29tcG9zZWRQYXRoKCk6dC5wYXRoO3JldHVybltfLmdldEFjdHVhbEVsZW1lbnQoZT9lWzBdOnQudGFyZ2V0KSxfLmdldEFjdHVhbEVsZW1lbnQodC5jdXJyZW50VGFyZ2V0KV19LEIubmV3Q29vcmRzPWZ1bmN0aW9uKCl7cmV0dXJue3BhZ2U6e3g6MCx5OjB9LGNsaWVudDp7eDowLHk6MH0sdGltZVN0YW1wOjB9fSxCLmNvb3Jkc1RvRXZlbnQ9ZnVuY3Rpb24odCl7cmV0dXJue2Nvb3Jkczp0LGdldCBwYWdlKCl7cmV0dXJuIHRoaXMuY29vcmRzLnBhZ2V9LGdldCBjbGllbnQoKXtyZXR1cm4gdGhpcy5jb29yZHMuY2xpZW50fSxnZXQgdGltZVN0YW1wKCl7cmV0dXJuIHRoaXMuY29vcmRzLnRpbWVTdGFtcH0sZ2V0IHBhZ2VYKCl7cmV0dXJuIHRoaXMuY29vcmRzLnBhZ2UueH0sZ2V0IHBhZ2VZKCl7cmV0dXJuIHRoaXMuY29vcmRzLnBhZ2UueX0sZ2V0IGNsaWVudFgoKXtyZXR1cm4gdGhpcy5jb29yZHMuY2xpZW50Lnh9LGdldCBjbGllbnRZKCl7cmV0dXJuIHRoaXMuY29vcmRzLmNsaWVudC55fSxnZXQgcG9pbnRlcklkKCl7cmV0dXJuIHRoaXMuY29vcmRzLnBvaW50ZXJJZH0sZ2V0IHRhcmdldCgpe3JldHVybiB0aGlzLmNvb3Jkcy50YXJnZXR9LGdldCB0eXBlKCl7cmV0dXJuIHRoaXMuY29vcmRzLnR5cGV9LGdldCBwb2ludGVyVHlwZSgpe3JldHVybiB0aGlzLmNvb3Jkcy5wb2ludGVyVHlwZX0sZ2V0IGJ1dHRvbnMoKXtyZXR1cm4gdGhpcy5jb29yZHMuYnV0dG9uc30scHJldmVudERlZmF1bHQ6ZnVuY3Rpb24oKXt9fX0sT2JqZWN0LmRlZmluZVByb3BlcnR5KEIsXCJwb2ludGVyRXh0ZW5kXCIse2VudW1lcmFibGU6ITAsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIEYuZGVmYXVsdH19KTt2YXIgJD17fTtmdW5jdGlvbiBHKHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHIua2V5LHIpfX1mdW5jdGlvbiBIKHQsZSxuKXtyZXR1cm4gZSBpbiB0P09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LGUse3ZhbHVlOm4sZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITB9KTp0W2VdPW4sdH1PYmplY3QuZGVmaW5lUHJvcGVydHkoJCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSwkLkJhc2VFdmVudD12b2lkIDA7dmFyIEs9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KGUpeyFmdW5jdGlvbih0LGUpe2lmKCEodCBpbnN0YW5jZW9mIGUpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9KHRoaXMsdCksSCh0aGlzLFwidHlwZVwiLHZvaWQgMCksSCh0aGlzLFwidGFyZ2V0XCIsdm9pZCAwKSxIKHRoaXMsXCJjdXJyZW50VGFyZ2V0XCIsdm9pZCAwKSxIKHRoaXMsXCJpbnRlcmFjdGFibGVcIix2b2lkIDApLEgodGhpcyxcIl9pbnRlcmFjdGlvblwiLHZvaWQgMCksSCh0aGlzLFwidGltZVN0YW1wXCIsdm9pZCAwKSxIKHRoaXMsXCJpbW1lZGlhdGVQcm9wYWdhdGlvblN0b3BwZWRcIiwhMSksSCh0aGlzLFwicHJvcGFnYXRpb25TdG9wcGVkXCIsITEpLHRoaXMuX2ludGVyYWN0aW9uPWV9dmFyIGUsbjtyZXR1cm4gZT10LChuPVt7a2V5OlwicHJldmVudERlZmF1bHRcIix2YWx1ZTpmdW5jdGlvbigpe319LHtrZXk6XCJzdG9wUHJvcGFnYXRpb25cIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMucHJvcGFnYXRpb25TdG9wcGVkPSEwfX0se2tleTpcInN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvblwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5pbW1lZGlhdGVQcm9wYWdhdGlvblN0b3BwZWQ9dGhpcy5wcm9wYWdhdGlvblN0b3BwZWQ9ITB9fV0pJiZHKGUucHJvdG90eXBlLG4pLHR9KCk7JC5CYXNlRXZlbnQ9SyxPYmplY3QuZGVmaW5lUHJvcGVydHkoSy5wcm90b3R5cGUsXCJpbnRlcmFjdGlvblwiLHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5faW50ZXJhY3Rpb24uX3Byb3h5fSxzZXQ6ZnVuY3Rpb24oKXt9fSk7dmFyIFo9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KFosXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksWi5maW5kPVouZmluZEluZGV4PVouZnJvbT1aLm1lcmdlPVoucmVtb3ZlPVouY29udGFpbnM9dm9pZCAwLFouY29udGFpbnM9ZnVuY3Rpb24odCxlKXtyZXR1cm4tMSE9PXQuaW5kZXhPZihlKX0sWi5yZW1vdmU9ZnVuY3Rpb24odCxlKXtyZXR1cm4gdC5zcGxpY2UodC5pbmRleE9mKGUpLDEpfTt2YXIgSj1mdW5jdGlvbih0LGUpe2Zvcih2YXIgbj0wO248ZS5sZW5ndGg7bisrKXt2YXIgcj1lW25dO3QucHVzaChyKX1yZXR1cm4gdH07Wi5tZXJnZT1KLFouZnJvbT1mdW5jdGlvbih0KXtyZXR1cm4gSihbXSx0KX07dmFyIFE9ZnVuY3Rpb24odCxlKXtmb3IodmFyIG49MDtuPHQubGVuZ3RoO24rKylpZihlKHRbbl0sbix0KSlyZXR1cm4gbjtyZXR1cm4tMX07Wi5maW5kSW5kZXg9USxaLmZpbmQ9ZnVuY3Rpb24odCxlKXtyZXR1cm4gdFtRKHQsZSldfTt2YXIgdHQ9e307ZnVuY3Rpb24gZXQodCl7cmV0dXJuKGV0PVwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmXCJzeW1ib2xcIj09dHlwZW9mIFN5bWJvbC5pdGVyYXRvcj9mdW5jdGlvbih0KXtyZXR1cm4gdHlwZW9mIHR9OmZ1bmN0aW9uKHQpe3JldHVybiB0JiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJnQuY29uc3RydWN0b3I9PT1TeW1ib2wmJnQhPT1TeW1ib2wucHJvdG90eXBlP1wic3ltYm9sXCI6dHlwZW9mIHR9KSh0KX1mdW5jdGlvbiBudCh0LGUpe2Zvcih2YXIgbj0wO248ZS5sZW5ndGg7bisrKXt2YXIgcj1lW25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkodCxyLmtleSxyKX19ZnVuY3Rpb24gcnQodCxlKXtyZXR1cm4ocnQ9T2JqZWN0LnNldFByb3RvdHlwZU9mfHxmdW5jdGlvbih0LGUpe3JldHVybiB0Ll9fcHJvdG9fXz1lLHR9KSh0LGUpfWZ1bmN0aW9uIG90KHQsZSl7cmV0dXJuIWV8fFwib2JqZWN0XCIhPT1ldChlKSYmXCJmdW5jdGlvblwiIT10eXBlb2YgZT9pdCh0KTplfWZ1bmN0aW9uIGl0KHQpe2lmKHZvaWQgMD09PXQpdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO3JldHVybiB0fWZ1bmN0aW9uIGF0KHQpe3JldHVybihhdD1PYmplY3Quc2V0UHJvdG90eXBlT2Y/T2JqZWN0LmdldFByb3RvdHlwZU9mOmZ1bmN0aW9uKHQpe3JldHVybiB0Ll9fcHJvdG9fX3x8T2JqZWN0LmdldFByb3RvdHlwZU9mKHQpfSkodCl9ZnVuY3Rpb24gc3QodCxlLG4pe3JldHVybiBlIGluIHQ/T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsZSx7dmFsdWU6bixlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMH0pOnRbZV09bix0fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0dCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0dC5Ecm9wRXZlbnQ9dm9pZCAwO3ZhciBsdD1mdW5jdGlvbih0KXshZnVuY3Rpb24odCxlKXtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiBlJiZudWxsIT09ZSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb25cIik7dC5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShlJiZlLnByb3RvdHlwZSx7Y29uc3RydWN0b3I6e3ZhbHVlOnQsd3JpdGFibGU6ITAsY29uZmlndXJhYmxlOiEwfX0pLGUmJnJ0KHQsZSl9KGEsdCk7dmFyIGUsbixyLG8saT0ocj1hLG89ZnVuY3Rpb24oKXtpZihcInVuZGVmaW5lZFwiPT10eXBlb2YgUmVmbGVjdHx8IVJlZmxlY3QuY29uc3RydWN0KXJldHVybiExO2lmKFJlZmxlY3QuY29uc3RydWN0LnNoYW0pcmV0dXJuITE7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgUHJveHkpcmV0dXJuITA7dHJ5e3JldHVybiBCb29sZWFuLnByb3RvdHlwZS52YWx1ZU9mLmNhbGwoUmVmbGVjdC5jb25zdHJ1Y3QoQm9vbGVhbixbXSwoZnVuY3Rpb24oKXt9KSkpLCEwfWNhdGNoKHQpe3JldHVybiExfX0oKSxmdW5jdGlvbigpe3ZhciB0LGU9YXQocik7aWYobyl7dmFyIG49YXQodGhpcykuY29uc3RydWN0b3I7dD1SZWZsZWN0LmNvbnN0cnVjdChlLGFyZ3VtZW50cyxuKX1lbHNlIHQ9ZS5hcHBseSh0aGlzLGFyZ3VtZW50cyk7cmV0dXJuIG90KHRoaXMsdCl9KTtmdW5jdGlvbiBhKHQsZSxuKXt2YXIgcjshZnVuY3Rpb24odCxlKXtpZighKHQgaW5zdGFuY2VvZiBlKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfSh0aGlzLGEpLHN0KGl0KHI9aS5jYWxsKHRoaXMsZS5faW50ZXJhY3Rpb24pKSxcInRhcmdldFwiLHZvaWQgMCksc3QoaXQociksXCJkcm9wem9uZVwiLHZvaWQgMCksc3QoaXQociksXCJkcmFnRXZlbnRcIix2b2lkIDApLHN0KGl0KHIpLFwicmVsYXRlZFRhcmdldFwiLHZvaWQgMCksc3QoaXQociksXCJkcmFnZ2FibGVcIix2b2lkIDApLHN0KGl0KHIpLFwidGltZVN0YW1wXCIsdm9pZCAwKSxzdChpdChyKSxcInByb3BhZ2F0aW9uU3RvcHBlZFwiLCExKSxzdChpdChyKSxcImltbWVkaWF0ZVByb3BhZ2F0aW9uU3RvcHBlZFwiLCExKTt2YXIgbz1cImRyYWdsZWF2ZVwiPT09bj90LnByZXY6dC5jdXIscz1vLmVsZW1lbnQsbD1vLmRyb3B6b25lO3JldHVybiByLnR5cGU9bixyLnRhcmdldD1zLHIuY3VycmVudFRhcmdldD1zLHIuZHJvcHpvbmU9bCxyLmRyYWdFdmVudD1lLHIucmVsYXRlZFRhcmdldD1lLnRhcmdldCxyLmRyYWdnYWJsZT1lLmludGVyYWN0YWJsZSxyLnRpbWVTdGFtcD1lLnRpbWVTdGFtcCxyfXJldHVybiBlPWEsKG49W3trZXk6XCJyZWplY3RcIix2YWx1ZTpmdW5jdGlvbigpe3ZhciB0PXRoaXMsZT10aGlzLl9pbnRlcmFjdGlvbi5kcm9wU3RhdGU7aWYoXCJkcm9wYWN0aXZhdGVcIj09PXRoaXMudHlwZXx8dGhpcy5kcm9wem9uZSYmZS5jdXIuZHJvcHpvbmU9PT10aGlzLmRyb3B6b25lJiZlLmN1ci5lbGVtZW50PT09dGhpcy50YXJnZXQpaWYoZS5wcmV2LmRyb3B6b25lPXRoaXMuZHJvcHpvbmUsZS5wcmV2LmVsZW1lbnQ9dGhpcy50YXJnZXQsZS5yZWplY3RlZD0hMCxlLmV2ZW50cy5lbnRlcj1udWxsLHRoaXMuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCksXCJkcm9wYWN0aXZhdGVcIj09PXRoaXMudHlwZSl7dmFyIG49ZS5hY3RpdmVEcm9wcyxyPVouZmluZEluZGV4KG4sKGZ1bmN0aW9uKGUpe3ZhciBuPWUuZHJvcHpvbmUscj1lLmVsZW1lbnQ7cmV0dXJuIG49PT10LmRyb3B6b25lJiZyPT09dC50YXJnZXR9KSk7ZS5hY3RpdmVEcm9wcy5zcGxpY2UociwxKTt2YXIgbz1uZXcgYShlLHRoaXMuZHJhZ0V2ZW50LFwiZHJvcGRlYWN0aXZhdGVcIik7by5kcm9wem9uZT10aGlzLmRyb3B6b25lLG8udGFyZ2V0PXRoaXMudGFyZ2V0LHRoaXMuZHJvcHpvbmUuZmlyZShvKX1lbHNlIHRoaXMuZHJvcHpvbmUuZmlyZShuZXcgYShlLHRoaXMuZHJhZ0V2ZW50LFwiZHJhZ2xlYXZlXCIpKX19LHtrZXk6XCJwcmV2ZW50RGVmYXVsdFwiLHZhbHVlOmZ1bmN0aW9uKCl7fX0se2tleTpcInN0b3BQcm9wYWdhdGlvblwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5wcm9wYWdhdGlvblN0b3BwZWQ9ITB9fSx7a2V5Olwic3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLmltbWVkaWF0ZVByb3BhZ2F0aW9uU3RvcHBlZD10aGlzLnByb3BhZ2F0aW9uU3RvcHBlZD0hMH19XSkmJm50KGUucHJvdG90eXBlLG4pLGF9KCQuQmFzZUV2ZW50KTt0dC5Ecm9wRXZlbnQ9bHQ7dmFyIHV0PXt9O2Z1bmN0aW9uIGN0KHQsZSl7Zm9yKHZhciBuPTA7bjx0LnNsaWNlKCkubGVuZ3RoO24rKyl7dmFyIHI9dC5zbGljZSgpW25dLG89ci5kcm9wem9uZSxpPXIuZWxlbWVudDtlLmRyb3B6b25lPW8sZS50YXJnZXQ9aSxvLmZpcmUoZSksZS5wcm9wYWdhdGlvblN0b3BwZWQ9ZS5pbW1lZGlhdGVQcm9wYWdhdGlvblN0b3BwZWQ9ITF9fWZ1bmN0aW9uIGZ0KHQsZSl7Zm9yKHZhciBuPWZ1bmN0aW9uKHQsZSl7Zm9yKHZhciBuPXQuaW50ZXJhY3RhYmxlcyxyPVtdLG89MDtvPG4ubGlzdC5sZW5ndGg7bysrKXt2YXIgYT1uLmxpc3Rbb107aWYoYS5vcHRpb25zLmRyb3AuZW5hYmxlZCl7dmFyIHM9YS5vcHRpb25zLmRyb3AuYWNjZXB0O2lmKCEoaS5kZWZhdWx0LmVsZW1lbnQocykmJnMhPT1lfHxpLmRlZmF1bHQuc3RyaW5nKHMpJiYhXy5tYXRjaGVzU2VsZWN0b3IoZSxzKXx8aS5kZWZhdWx0LmZ1bmMocykmJiFzKHtkcm9wem9uZTphLGRyYWdnYWJsZUVsZW1lbnQ6ZX0pKSlmb3IodmFyIGw9aS5kZWZhdWx0LnN0cmluZyhhLnRhcmdldCk/YS5fY29udGV4dC5xdWVyeVNlbGVjdG9yQWxsKGEudGFyZ2V0KTppLmRlZmF1bHQuYXJyYXkoYS50YXJnZXQpP2EudGFyZ2V0OlthLnRhcmdldF0sdT0wO3U8bC5sZW5ndGg7dSsrKXt2YXIgYz1sW3VdO2MhPT1lJiZyLnB1c2goe2Ryb3B6b25lOmEsZWxlbWVudDpjLHJlY3Q6YS5nZXRSZWN0KGMpfSl9fX1yZXR1cm4gcn0odCxlKSxyPTA7cjxuLmxlbmd0aDtyKyspe3ZhciBvPW5bcl07by5yZWN0PW8uZHJvcHpvbmUuZ2V0UmVjdChvLmVsZW1lbnQpfXJldHVybiBufWZ1bmN0aW9uIGR0KHQsZSxuKXtmb3IodmFyIHI9dC5kcm9wU3RhdGUsbz10LmludGVyYWN0YWJsZSxpPXQuZWxlbWVudCxhPVtdLHM9MDtzPHIuYWN0aXZlRHJvcHMubGVuZ3RoO3MrKyl7dmFyIGw9ci5hY3RpdmVEcm9wc1tzXSx1PWwuZHJvcHpvbmUsYz1sLmVsZW1lbnQsZj1sLnJlY3Q7YS5wdXNoKHUuZHJvcENoZWNrKGUsbixvLGksYyxmKT9jOm51bGwpfXZhciBkPV8uaW5kZXhPZkRlZXBlc3RFbGVtZW50KGEpO3JldHVybiByLmFjdGl2ZURyb3BzW2RdfHxudWxsfWZ1bmN0aW9uIHB0KHQsZSxuKXt2YXIgcj10LmRyb3BTdGF0ZSxvPXtlbnRlcjpudWxsLGxlYXZlOm51bGwsYWN0aXZhdGU6bnVsbCxkZWFjdGl2YXRlOm51bGwsbW92ZTpudWxsLGRyb3A6bnVsbH07cmV0dXJuXCJkcmFnc3RhcnRcIj09PW4udHlwZSYmKG8uYWN0aXZhdGU9bmV3IHR0LkRyb3BFdmVudChyLG4sXCJkcm9wYWN0aXZhdGVcIiksby5hY3RpdmF0ZS50YXJnZXQ9bnVsbCxvLmFjdGl2YXRlLmRyb3B6b25lPW51bGwpLFwiZHJhZ2VuZFwiPT09bi50eXBlJiYoby5kZWFjdGl2YXRlPW5ldyB0dC5Ecm9wRXZlbnQocixuLFwiZHJvcGRlYWN0aXZhdGVcIiksby5kZWFjdGl2YXRlLnRhcmdldD1udWxsLG8uZGVhY3RpdmF0ZS5kcm9wem9uZT1udWxsKSxyLnJlamVjdGVkfHwoci5jdXIuZWxlbWVudCE9PXIucHJldi5lbGVtZW50JiYoci5wcmV2LmRyb3B6b25lJiYoby5sZWF2ZT1uZXcgdHQuRHJvcEV2ZW50KHIsbixcImRyYWdsZWF2ZVwiKSxuLmRyYWdMZWF2ZT1vLmxlYXZlLnRhcmdldD1yLnByZXYuZWxlbWVudCxuLnByZXZEcm9wem9uZT1vLmxlYXZlLmRyb3B6b25lPXIucHJldi5kcm9wem9uZSksci5jdXIuZHJvcHpvbmUmJihvLmVudGVyPW5ldyB0dC5Ecm9wRXZlbnQocixuLFwiZHJhZ2VudGVyXCIpLG4uZHJhZ0VudGVyPXIuY3VyLmVsZW1lbnQsbi5kcm9wem9uZT1yLmN1ci5kcm9wem9uZSkpLFwiZHJhZ2VuZFwiPT09bi50eXBlJiZyLmN1ci5kcm9wem9uZSYmKG8uZHJvcD1uZXcgdHQuRHJvcEV2ZW50KHIsbixcImRyb3BcIiksbi5kcm9wem9uZT1yLmN1ci5kcm9wem9uZSxuLnJlbGF0ZWRUYXJnZXQ9ci5jdXIuZWxlbWVudCksXCJkcmFnbW92ZVwiPT09bi50eXBlJiZyLmN1ci5kcm9wem9uZSYmKG8ubW92ZT1uZXcgdHQuRHJvcEV2ZW50KHIsbixcImRyb3Btb3ZlXCIpLG8ubW92ZS5kcmFnbW92ZT1uLG4uZHJvcHpvbmU9ci5jdXIuZHJvcHpvbmUpKSxvfWZ1bmN0aW9uIHZ0KHQsZSl7dmFyIG49dC5kcm9wU3RhdGUscj1uLmFjdGl2ZURyb3BzLG89bi5jdXIsaT1uLnByZXY7ZS5sZWF2ZSYmaS5kcm9wem9uZS5maXJlKGUubGVhdmUpLGUuZW50ZXImJm8uZHJvcHpvbmUuZmlyZShlLmVudGVyKSxlLm1vdmUmJm8uZHJvcHpvbmUuZmlyZShlLm1vdmUpLGUuZHJvcCYmby5kcm9wem9uZS5maXJlKGUuZHJvcCksZS5kZWFjdGl2YXRlJiZjdChyLGUuZGVhY3RpdmF0ZSksbi5wcmV2LmRyb3B6b25lPW8uZHJvcHpvbmUsbi5wcmV2LmVsZW1lbnQ9by5lbGVtZW50fWZ1bmN0aW9uIGh0KHQsZSl7dmFyIG49dC5pbnRlcmFjdGlvbixyPXQuaUV2ZW50LG89dC5ldmVudDtpZihcImRyYWdtb3ZlXCI9PT1yLnR5cGV8fFwiZHJhZ2VuZFwiPT09ci50eXBlKXt2YXIgaT1uLmRyb3BTdGF0ZTtlLmR5bmFtaWNEcm9wJiYoaS5hY3RpdmVEcm9wcz1mdChlLG4uZWxlbWVudCkpO3ZhciBhPXIscz1kdChuLGEsbyk7aS5yZWplY3RlZD1pLnJlamVjdGVkJiYhIXMmJnMuZHJvcHpvbmU9PT1pLmN1ci5kcm9wem9uZSYmcy5lbGVtZW50PT09aS5jdXIuZWxlbWVudCxpLmN1ci5kcm9wem9uZT1zJiZzLmRyb3B6b25lLGkuY3VyLmVsZW1lbnQ9cyYmcy5lbGVtZW50LGkuZXZlbnRzPXB0KG4sMCxhKX19T2JqZWN0LmRlZmluZVByb3BlcnR5KHV0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHV0LmRlZmF1bHQ9dm9pZCAwO3ZhciBndD17aWQ6XCJhY3Rpb25zL2Ryb3BcIixpbnN0YWxsOmZ1bmN0aW9uKHQpe3ZhciBlPXQuYWN0aW9ucyxuPXQuaW50ZXJhY3RTdGF0aWMscj10LkludGVyYWN0YWJsZSxvPXQuZGVmYXVsdHM7dC51c2VQbHVnaW4oYy5kZWZhdWx0KSxyLnByb3RvdHlwZS5kcm9wem9uZT1mdW5jdGlvbih0KXtyZXR1cm4gZnVuY3Rpb24odCxlKXtpZihpLmRlZmF1bHQub2JqZWN0KGUpKXtpZih0Lm9wdGlvbnMuZHJvcC5lbmFibGVkPSExIT09ZS5lbmFibGVkLGUubGlzdGVuZXJzKXt2YXIgbj0oMCxSLmRlZmF1bHQpKGUubGlzdGVuZXJzKSxyPU9iamVjdC5rZXlzKG4pLnJlZHVjZSgoZnVuY3Rpb24odCxlKXtyZXR1cm4gdFsvXihlbnRlcnxsZWF2ZSkvLnRlc3QoZSk/XCJkcmFnXCIuY29uY2F0KGUpOi9eKGFjdGl2YXRlfGRlYWN0aXZhdGV8bW92ZSkvLnRlc3QoZSk/XCJkcm9wXCIuY29uY2F0KGUpOmVdPW5bZV0sdH0pLHt9KTt0Lm9mZih0Lm9wdGlvbnMuZHJvcC5saXN0ZW5lcnMpLHQub24ociksdC5vcHRpb25zLmRyb3AubGlzdGVuZXJzPXJ9cmV0dXJuIGkuZGVmYXVsdC5mdW5jKGUub25kcm9wKSYmdC5vbihcImRyb3BcIixlLm9uZHJvcCksaS5kZWZhdWx0LmZ1bmMoZS5vbmRyb3BhY3RpdmF0ZSkmJnQub24oXCJkcm9wYWN0aXZhdGVcIixlLm9uZHJvcGFjdGl2YXRlKSxpLmRlZmF1bHQuZnVuYyhlLm9uZHJvcGRlYWN0aXZhdGUpJiZ0Lm9uKFwiZHJvcGRlYWN0aXZhdGVcIixlLm9uZHJvcGRlYWN0aXZhdGUpLGkuZGVmYXVsdC5mdW5jKGUub25kcmFnZW50ZXIpJiZ0Lm9uKFwiZHJhZ2VudGVyXCIsZS5vbmRyYWdlbnRlciksaS5kZWZhdWx0LmZ1bmMoZS5vbmRyYWdsZWF2ZSkmJnQub24oXCJkcmFnbGVhdmVcIixlLm9uZHJhZ2xlYXZlKSxpLmRlZmF1bHQuZnVuYyhlLm9uZHJvcG1vdmUpJiZ0Lm9uKFwiZHJvcG1vdmVcIixlLm9uZHJvcG1vdmUpLC9eKHBvaW50ZXJ8Y2VudGVyKSQvLnRlc3QoZS5vdmVybGFwKT90Lm9wdGlvbnMuZHJvcC5vdmVybGFwPWUub3ZlcmxhcDppLmRlZmF1bHQubnVtYmVyKGUub3ZlcmxhcCkmJih0Lm9wdGlvbnMuZHJvcC5vdmVybGFwPU1hdGgubWF4KE1hdGgubWluKDEsZS5vdmVybGFwKSwwKSksXCJhY2NlcHRcImluIGUmJih0Lm9wdGlvbnMuZHJvcC5hY2NlcHQ9ZS5hY2NlcHQpLFwiY2hlY2tlclwiaW4gZSYmKHQub3B0aW9ucy5kcm9wLmNoZWNrZXI9ZS5jaGVja2VyKSx0fXJldHVybiBpLmRlZmF1bHQuYm9vbChlKT8odC5vcHRpb25zLmRyb3AuZW5hYmxlZD1lLHQpOnQub3B0aW9ucy5kcm9wfSh0aGlzLHQpfSxyLnByb3RvdHlwZS5kcm9wQ2hlY2s9ZnVuY3Rpb24odCxlLG4scixvLGEpe3JldHVybiBmdW5jdGlvbih0LGUsbixyLG8sYSxzKXt2YXIgbD0hMTtpZighKHM9c3x8dC5nZXRSZWN0KGEpKSlyZXR1cm4hIXQub3B0aW9ucy5kcm9wLmNoZWNrZXImJnQub3B0aW9ucy5kcm9wLmNoZWNrZXIoZSxuLGwsdCxhLHIsbyk7dmFyIHU9dC5vcHRpb25zLmRyb3Aub3ZlcmxhcDtpZihcInBvaW50ZXJcIj09PXUpe3ZhciBjPSgwLEEuZGVmYXVsdCkocixvLFwiZHJhZ1wiKSxmPUIuZ2V0UGFnZVhZKGUpO2YueCs9Yy54LGYueSs9Yy55O3ZhciBkPWYueD5zLmxlZnQmJmYueDxzLnJpZ2h0LHA9Zi55PnMudG9wJiZmLnk8cy5ib3R0b207bD1kJiZwfXZhciB2PXIuZ2V0UmVjdChvKTtpZih2JiZcImNlbnRlclwiPT09dSl7dmFyIGg9di5sZWZ0K3Yud2lkdGgvMixnPXYudG9wK3YuaGVpZ2h0LzI7bD1oPj1zLmxlZnQmJmg8PXMucmlnaHQmJmc+PXMudG9wJiZnPD1zLmJvdHRvbX1yZXR1cm4gdiYmaS5kZWZhdWx0Lm51bWJlcih1KSYmKGw9TWF0aC5tYXgoMCxNYXRoLm1pbihzLnJpZ2h0LHYucmlnaHQpLU1hdGgubWF4KHMubGVmdCx2LmxlZnQpKSpNYXRoLm1heCgwLE1hdGgubWluKHMuYm90dG9tLHYuYm90dG9tKS1NYXRoLm1heChzLnRvcCx2LnRvcCkpLyh2LndpZHRoKnYuaGVpZ2h0KT49dSksdC5vcHRpb25zLmRyb3AuY2hlY2tlciYmKGw9dC5vcHRpb25zLmRyb3AuY2hlY2tlcihlLG4sbCx0LGEscixvKSksbH0odGhpcyx0LGUsbixyLG8sYSl9LG4uZHluYW1pY0Ryb3A9ZnVuY3Rpb24oZSl7cmV0dXJuIGkuZGVmYXVsdC5ib29sKGUpPyh0LmR5bmFtaWNEcm9wPWUsbik6dC5keW5hbWljRHJvcH0sKDAsai5kZWZhdWx0KShlLnBoYXNlbGVzc1R5cGVzLHtkcmFnZW50ZXI6ITAsZHJhZ2xlYXZlOiEwLGRyb3BhY3RpdmF0ZTohMCxkcm9wZGVhY3RpdmF0ZTohMCxkcm9wbW92ZTohMCxkcm9wOiEwfSksZS5tZXRob2REaWN0LmRyb3A9XCJkcm9wem9uZVwiLHQuZHluYW1pY0Ryb3A9ITEsby5hY3Rpb25zLmRyb3A9Z3QuZGVmYXVsdHN9LGxpc3RlbmVyczp7XCJpbnRlcmFjdGlvbnM6YmVmb3JlLWFjdGlvbi1zdGFydFwiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb247XCJkcmFnXCI9PT1lLnByZXBhcmVkLm5hbWUmJihlLmRyb3BTdGF0ZT17Y3VyOntkcm9wem9uZTpudWxsLGVsZW1lbnQ6bnVsbH0scHJldjp7ZHJvcHpvbmU6bnVsbCxlbGVtZW50Om51bGx9LHJlamVjdGVkOm51bGwsZXZlbnRzOm51bGwsYWN0aXZlRHJvcHM6W119KX0sXCJpbnRlcmFjdGlvbnM6YWZ0ZXItYWN0aW9uLXN0YXJ0XCI6ZnVuY3Rpb24odCxlKXt2YXIgbj10LmludGVyYWN0aW9uLHI9KHQuZXZlbnQsdC5pRXZlbnQpO2lmKFwiZHJhZ1wiPT09bi5wcmVwYXJlZC5uYW1lKXt2YXIgbz1uLmRyb3BTdGF0ZTtvLmFjdGl2ZURyb3BzPW51bGwsby5ldmVudHM9bnVsbCxvLmFjdGl2ZURyb3BzPWZ0KGUsbi5lbGVtZW50KSxvLmV2ZW50cz1wdChuLDAsciksby5ldmVudHMuYWN0aXZhdGUmJihjdChvLmFjdGl2ZURyb3BzLG8uZXZlbnRzLmFjdGl2YXRlKSxlLmZpcmUoXCJhY3Rpb25zL2Ryb3A6c3RhcnRcIix7aW50ZXJhY3Rpb246bixkcmFnRXZlbnQ6cn0pKX19LFwiaW50ZXJhY3Rpb25zOmFjdGlvbi1tb3ZlXCI6aHQsXCJpbnRlcmFjdGlvbnM6YWZ0ZXItYWN0aW9uLW1vdmVcIjpmdW5jdGlvbih0LGUpe3ZhciBuPXQuaW50ZXJhY3Rpb24scj10LmlFdmVudDtcImRyYWdcIj09PW4ucHJlcGFyZWQubmFtZSYmKHZ0KG4sbi5kcm9wU3RhdGUuZXZlbnRzKSxlLmZpcmUoXCJhY3Rpb25zL2Ryb3A6bW92ZVwiLHtpbnRlcmFjdGlvbjpuLGRyYWdFdmVudDpyfSksbi5kcm9wU3RhdGUuZXZlbnRzPXt9KX0sXCJpbnRlcmFjdGlvbnM6YWN0aW9uLWVuZFwiOmZ1bmN0aW9uKHQsZSl7aWYoXCJkcmFnXCI9PT10LmludGVyYWN0aW9uLnByZXBhcmVkLm5hbWUpe3ZhciBuPXQuaW50ZXJhY3Rpb24scj10LmlFdmVudDtodCh0LGUpLHZ0KG4sbi5kcm9wU3RhdGUuZXZlbnRzKSxlLmZpcmUoXCJhY3Rpb25zL2Ryb3A6ZW5kXCIse2ludGVyYWN0aW9uOm4sZHJhZ0V2ZW50OnJ9KX19LFwiaW50ZXJhY3Rpb25zOnN0b3BcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uO2lmKFwiZHJhZ1wiPT09ZS5wcmVwYXJlZC5uYW1lKXt2YXIgbj1lLmRyb3BTdGF0ZTtuJiYobi5hY3RpdmVEcm9wcz1udWxsLG4uZXZlbnRzPW51bGwsbi5jdXIuZHJvcHpvbmU9bnVsbCxuLmN1ci5lbGVtZW50PW51bGwsbi5wcmV2LmRyb3B6b25lPW51bGwsbi5wcmV2LmVsZW1lbnQ9bnVsbCxuLnJlamVjdGVkPSExKX19fSxnZXRBY3RpdmVEcm9wczpmdCxnZXREcm9wOmR0LGdldERyb3BFdmVudHM6cHQsZmlyZURyb3BFdmVudHM6dnQsZGVmYXVsdHM6e2VuYWJsZWQ6ITEsYWNjZXB0Om51bGwsb3ZlcmxhcDpcInBvaW50ZXJcIn19LHl0PWd0O3V0LmRlZmF1bHQ9eXQ7dmFyIG10PXt9O2Z1bmN0aW9uIGJ0KHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24sbj10LmlFdmVudCxyPXQucGhhc2U7aWYoXCJnZXN0dXJlXCI9PT1lLnByZXBhcmVkLm5hbWUpe3ZhciBvPWUucG9pbnRlcnMubWFwKChmdW5jdGlvbih0KXtyZXR1cm4gdC5wb2ludGVyfSkpLGE9XCJzdGFydFwiPT09cixzPVwiZW5kXCI9PT1yLGw9ZS5pbnRlcmFjdGFibGUub3B0aW9ucy5kZWx0YVNvdXJjZTtpZihuLnRvdWNoZXM9W29bMF0sb1sxXV0sYSluLmRpc3RhbmNlPUIudG91Y2hEaXN0YW5jZShvLGwpLG4uYm94PUIudG91Y2hCQm94KG8pLG4uc2NhbGU9MSxuLmRzPTAsbi5hbmdsZT1CLnRvdWNoQW5nbGUobyxsKSxuLmRhPTAsZS5nZXN0dXJlLnN0YXJ0RGlzdGFuY2U9bi5kaXN0YW5jZSxlLmdlc3R1cmUuc3RhcnRBbmdsZT1uLmFuZ2xlO2Vsc2UgaWYocyl7dmFyIHU9ZS5wcmV2RXZlbnQ7bi5kaXN0YW5jZT11LmRpc3RhbmNlLG4uYm94PXUuYm94LG4uc2NhbGU9dS5zY2FsZSxuLmRzPTAsbi5hbmdsZT11LmFuZ2xlLG4uZGE9MH1lbHNlIG4uZGlzdGFuY2U9Qi50b3VjaERpc3RhbmNlKG8sbCksbi5ib3g9Qi50b3VjaEJCb3gobyksbi5zY2FsZT1uLmRpc3RhbmNlL2UuZ2VzdHVyZS5zdGFydERpc3RhbmNlLG4uYW5nbGU9Qi50b3VjaEFuZ2xlKG8sbCksbi5kcz1uLnNjYWxlLWUuZ2VzdHVyZS5zY2FsZSxuLmRhPW4uYW5nbGUtZS5nZXN0dXJlLmFuZ2xlO2UuZ2VzdHVyZS5kaXN0YW5jZT1uLmRpc3RhbmNlLGUuZ2VzdHVyZS5hbmdsZT1uLmFuZ2xlLGkuZGVmYXVsdC5udW1iZXIobi5zY2FsZSkmJm4uc2NhbGUhPT0xLzAmJiFpc05hTihuLnNjYWxlKSYmKGUuZ2VzdHVyZS5zY2FsZT1uLnNjYWxlKX19T2JqZWN0LmRlZmluZVByb3BlcnR5KG10LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLG10LmRlZmF1bHQ9dm9pZCAwO3ZhciB4dD17aWQ6XCJhY3Rpb25zL2dlc3R1cmVcIixiZWZvcmU6W1wiYWN0aW9ucy9kcmFnXCIsXCJhY3Rpb25zL3Jlc2l6ZVwiXSxpbnN0YWxsOmZ1bmN0aW9uKHQpe3ZhciBlPXQuYWN0aW9ucyxuPXQuSW50ZXJhY3RhYmxlLHI9dC5kZWZhdWx0cztuLnByb3RvdHlwZS5nZXN0dXJhYmxlPWZ1bmN0aW9uKHQpe3JldHVybiBpLmRlZmF1bHQub2JqZWN0KHQpPyh0aGlzLm9wdGlvbnMuZ2VzdHVyZS5lbmFibGVkPSExIT09dC5lbmFibGVkLHRoaXMuc2V0UGVyQWN0aW9uKFwiZ2VzdHVyZVwiLHQpLHRoaXMuc2V0T25FdmVudHMoXCJnZXN0dXJlXCIsdCksdGhpcyk6aS5kZWZhdWx0LmJvb2wodCk/KHRoaXMub3B0aW9ucy5nZXN0dXJlLmVuYWJsZWQ9dCx0aGlzKTp0aGlzLm9wdGlvbnMuZ2VzdHVyZX0sZS5tYXAuZ2VzdHVyZT14dCxlLm1ldGhvZERpY3QuZ2VzdHVyZT1cImdlc3R1cmFibGVcIixyLmFjdGlvbnMuZ2VzdHVyZT14dC5kZWZhdWx0c30sbGlzdGVuZXJzOntcImludGVyYWN0aW9uczphY3Rpb24tc3RhcnRcIjpidCxcImludGVyYWN0aW9uczphY3Rpb24tbW92ZVwiOmJ0LFwiaW50ZXJhY3Rpb25zOmFjdGlvbi1lbmRcIjpidCxcImludGVyYWN0aW9uczpuZXdcIjpmdW5jdGlvbih0KXt0LmludGVyYWN0aW9uLmdlc3R1cmU9e2FuZ2xlOjAsZGlzdGFuY2U6MCxzY2FsZToxLHN0YXJ0QW5nbGU6MCxzdGFydERpc3RhbmNlOjB9fSxcImF1dG8tc3RhcnQ6Y2hlY2tcIjpmdW5jdGlvbih0KXtpZighKHQuaW50ZXJhY3Rpb24ucG9pbnRlcnMubGVuZ3RoPDIpKXt2YXIgZT10LmludGVyYWN0YWJsZS5vcHRpb25zLmdlc3R1cmU7aWYoZSYmZS5lbmFibGVkKXJldHVybiB0LmFjdGlvbj17bmFtZTpcImdlc3R1cmVcIn0sITF9fX0sZGVmYXVsdHM6e30sZ2V0Q3Vyc29yOmZ1bmN0aW9uKCl7cmV0dXJuXCJcIn19LHd0PXh0O210LmRlZmF1bHQ9d3Q7dmFyIF90PXt9O2Z1bmN0aW9uIFB0KHQsZSxuLHIsbyxhLHMpe2lmKCFlKXJldHVybiExO2lmKCEwPT09ZSl7dmFyIGw9aS5kZWZhdWx0Lm51bWJlcihhLndpZHRoKT9hLndpZHRoOmEucmlnaHQtYS5sZWZ0LHU9aS5kZWZhdWx0Lm51bWJlcihhLmhlaWdodCk/YS5oZWlnaHQ6YS5ib3R0b20tYS50b3A7aWYocz1NYXRoLm1pbihzLE1hdGguYWJzKChcImxlZnRcIj09PXR8fFwicmlnaHRcIj09PXQ/bDp1KS8yKSksbDwwJiYoXCJsZWZ0XCI9PT10P3Q9XCJyaWdodFwiOlwicmlnaHRcIj09PXQmJih0PVwibGVmdFwiKSksdTwwJiYoXCJ0b3BcIj09PXQ/dD1cImJvdHRvbVwiOlwiYm90dG9tXCI9PT10JiYodD1cInRvcFwiKSksXCJsZWZ0XCI9PT10KXJldHVybiBuLng8KGw+PTA/YS5sZWZ0OmEucmlnaHQpK3M7aWYoXCJ0b3BcIj09PXQpcmV0dXJuIG4ueTwodT49MD9hLnRvcDphLmJvdHRvbSkrcztpZihcInJpZ2h0XCI9PT10KXJldHVybiBuLng+KGw+PTA/YS5yaWdodDphLmxlZnQpLXM7aWYoXCJib3R0b21cIj09PXQpcmV0dXJuIG4ueT4odT49MD9hLmJvdHRvbTphLnRvcCktc31yZXR1cm4hIWkuZGVmYXVsdC5lbGVtZW50KHIpJiYoaS5kZWZhdWx0LmVsZW1lbnQoZSk/ZT09PXI6Xy5tYXRjaGVzVXBUbyhyLGUsbykpfWZ1bmN0aW9uIE90KHQpe3ZhciBlPXQuaUV2ZW50LG49dC5pbnRlcmFjdGlvbjtpZihcInJlc2l6ZVwiPT09bi5wcmVwYXJlZC5uYW1lJiZuLnJlc2l6ZUF4ZXMpe3ZhciByPWU7bi5pbnRlcmFjdGFibGUub3B0aW9ucy5yZXNpemUuc3F1YXJlPyhcInlcIj09PW4ucmVzaXplQXhlcz9yLmRlbHRhLng9ci5kZWx0YS55OnIuZGVsdGEueT1yLmRlbHRhLngsci5heGVzPVwieHlcIik6KHIuYXhlcz1uLnJlc2l6ZUF4ZXMsXCJ4XCI9PT1uLnJlc2l6ZUF4ZXM/ci5kZWx0YS55PTA6XCJ5XCI9PT1uLnJlc2l6ZUF4ZXMmJihyLmRlbHRhLng9MCkpfX1PYmplY3QuZGVmaW5lUHJvcGVydHkoX3QsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksX3QuZGVmYXVsdD12b2lkIDA7dmFyIFN0PXtpZDpcImFjdGlvbnMvcmVzaXplXCIsYmVmb3JlOltcImFjdGlvbnMvZHJhZ1wiXSxpbnN0YWxsOmZ1bmN0aW9uKHQpe3ZhciBlPXQuYWN0aW9ucyxuPXQuYnJvd3NlcixyPXQuSW50ZXJhY3RhYmxlLG89dC5kZWZhdWx0cztTdC5jdXJzb3JzPWZ1bmN0aW9uKHQpe3JldHVybiB0LmlzSWU5P3t4OlwiZS1yZXNpemVcIix5Olwicy1yZXNpemVcIix4eTpcInNlLXJlc2l6ZVwiLHRvcDpcIm4tcmVzaXplXCIsbGVmdDpcInctcmVzaXplXCIsYm90dG9tOlwicy1yZXNpemVcIixyaWdodDpcImUtcmVzaXplXCIsdG9wbGVmdDpcInNlLXJlc2l6ZVwiLGJvdHRvbXJpZ2h0Olwic2UtcmVzaXplXCIsdG9wcmlnaHQ6XCJuZS1yZXNpemVcIixib3R0b21sZWZ0OlwibmUtcmVzaXplXCJ9Ont4OlwiZXctcmVzaXplXCIseTpcIm5zLXJlc2l6ZVwiLHh5OlwibndzZS1yZXNpemVcIix0b3A6XCJucy1yZXNpemVcIixsZWZ0OlwiZXctcmVzaXplXCIsYm90dG9tOlwibnMtcmVzaXplXCIscmlnaHQ6XCJldy1yZXNpemVcIix0b3BsZWZ0OlwibndzZS1yZXNpemVcIixib3R0b21yaWdodDpcIm53c2UtcmVzaXplXCIsdG9wcmlnaHQ6XCJuZXN3LXJlc2l6ZVwiLGJvdHRvbWxlZnQ6XCJuZXN3LXJlc2l6ZVwifX0obiksU3QuZGVmYXVsdE1hcmdpbj1uLnN1cHBvcnRzVG91Y2h8fG4uc3VwcG9ydHNQb2ludGVyRXZlbnQ/MjA6MTAsci5wcm90b3R5cGUucmVzaXphYmxlPWZ1bmN0aW9uKGUpe3JldHVybiBmdW5jdGlvbih0LGUsbil7cmV0dXJuIGkuZGVmYXVsdC5vYmplY3QoZSk/KHQub3B0aW9ucy5yZXNpemUuZW5hYmxlZD0hMSE9PWUuZW5hYmxlZCx0LnNldFBlckFjdGlvbihcInJlc2l6ZVwiLGUpLHQuc2V0T25FdmVudHMoXCJyZXNpemVcIixlKSxpLmRlZmF1bHQuc3RyaW5nKGUuYXhpcykmJi9eeCR8XnkkfF54eSQvLnRlc3QoZS5heGlzKT90Lm9wdGlvbnMucmVzaXplLmF4aXM9ZS5heGlzOm51bGw9PT1lLmF4aXMmJih0Lm9wdGlvbnMucmVzaXplLmF4aXM9bi5kZWZhdWx0cy5hY3Rpb25zLnJlc2l6ZS5heGlzKSxpLmRlZmF1bHQuYm9vbChlLnByZXNlcnZlQXNwZWN0UmF0aW8pP3Qub3B0aW9ucy5yZXNpemUucHJlc2VydmVBc3BlY3RSYXRpbz1lLnByZXNlcnZlQXNwZWN0UmF0aW86aS5kZWZhdWx0LmJvb2woZS5zcXVhcmUpJiYodC5vcHRpb25zLnJlc2l6ZS5zcXVhcmU9ZS5zcXVhcmUpLHQpOmkuZGVmYXVsdC5ib29sKGUpPyh0Lm9wdGlvbnMucmVzaXplLmVuYWJsZWQ9ZSx0KTp0Lm9wdGlvbnMucmVzaXplfSh0aGlzLGUsdCl9LGUubWFwLnJlc2l6ZT1TdCxlLm1ldGhvZERpY3QucmVzaXplPVwicmVzaXphYmxlXCIsby5hY3Rpb25zLnJlc2l6ZT1TdC5kZWZhdWx0c30sbGlzdGVuZXJzOntcImludGVyYWN0aW9uczpuZXdcIjpmdW5jdGlvbih0KXt0LmludGVyYWN0aW9uLnJlc2l6ZUF4ZXM9XCJ4eVwifSxcImludGVyYWN0aW9uczphY3Rpb24tc3RhcnRcIjpmdW5jdGlvbih0KXshZnVuY3Rpb24odCl7dmFyIGU9dC5pRXZlbnQsbj10LmludGVyYWN0aW9uO2lmKFwicmVzaXplXCI9PT1uLnByZXBhcmVkLm5hbWUmJm4ucHJlcGFyZWQuZWRnZXMpe3ZhciByPWUsbz1uLnJlY3Q7bi5fcmVjdHM9e3N0YXJ0OigwLGouZGVmYXVsdCkoe30sbyksY29ycmVjdGVkOigwLGouZGVmYXVsdCkoe30sbykscHJldmlvdXM6KDAsai5kZWZhdWx0KSh7fSxvKSxkZWx0YTp7bGVmdDowLHJpZ2h0OjAsd2lkdGg6MCx0b3A6MCxib3R0b206MCxoZWlnaHQ6MH19LHIuZWRnZXM9bi5wcmVwYXJlZC5lZGdlcyxyLnJlY3Q9bi5fcmVjdHMuY29ycmVjdGVkLHIuZGVsdGFSZWN0PW4uX3JlY3RzLmRlbHRhfX0odCksT3QodCl9LFwiaW50ZXJhY3Rpb25zOmFjdGlvbi1tb3ZlXCI6ZnVuY3Rpb24odCl7IWZ1bmN0aW9uKHQpe3ZhciBlPXQuaUV2ZW50LG49dC5pbnRlcmFjdGlvbjtpZihcInJlc2l6ZVwiPT09bi5wcmVwYXJlZC5uYW1lJiZuLnByZXBhcmVkLmVkZ2VzKXt2YXIgcj1lLG89bi5pbnRlcmFjdGFibGUub3B0aW9ucy5yZXNpemUuaW52ZXJ0LGk9XCJyZXBvc2l0aW9uXCI9PT1vfHxcIm5lZ2F0ZVwiPT09byxhPW4ucmVjdCxzPW4uX3JlY3RzLGw9cy5zdGFydCx1PXMuY29ycmVjdGVkLGM9cy5kZWx0YSxmPXMucHJldmlvdXM7aWYoKDAsai5kZWZhdWx0KShmLHUpLGkpe2lmKCgwLGouZGVmYXVsdCkodSxhKSxcInJlcG9zaXRpb25cIj09PW8pe2lmKHUudG9wPnUuYm90dG9tKXt2YXIgZD11LnRvcDt1LnRvcD11LmJvdHRvbSx1LmJvdHRvbT1kfWlmKHUubGVmdD51LnJpZ2h0KXt2YXIgcD11LmxlZnQ7dS5sZWZ0PXUucmlnaHQsdS5yaWdodD1wfX19ZWxzZSB1LnRvcD1NYXRoLm1pbihhLnRvcCxsLmJvdHRvbSksdS5ib3R0b209TWF0aC5tYXgoYS5ib3R0b20sbC50b3ApLHUubGVmdD1NYXRoLm1pbihhLmxlZnQsbC5yaWdodCksdS5yaWdodD1NYXRoLm1heChhLnJpZ2h0LGwubGVmdCk7Zm9yKHZhciB2IGluIHUud2lkdGg9dS5yaWdodC11LmxlZnQsdS5oZWlnaHQ9dS5ib3R0b20tdS50b3AsdSljW3ZdPXVbdl0tZlt2XTtyLmVkZ2VzPW4ucHJlcGFyZWQuZWRnZXMsci5yZWN0PXUsci5kZWx0YVJlY3Q9Y319KHQpLE90KHQpfSxcImludGVyYWN0aW9uczphY3Rpb24tZW5kXCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pRXZlbnQsbj10LmludGVyYWN0aW9uO2lmKFwicmVzaXplXCI9PT1uLnByZXBhcmVkLm5hbWUmJm4ucHJlcGFyZWQuZWRnZXMpe3ZhciByPWU7ci5lZGdlcz1uLnByZXBhcmVkLmVkZ2VzLHIucmVjdD1uLl9yZWN0cy5jb3JyZWN0ZWQsci5kZWx0YVJlY3Q9bi5fcmVjdHMuZGVsdGF9fSxcImF1dG8tc3RhcnQ6Y2hlY2tcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uLG49dC5pbnRlcmFjdGFibGUscj10LmVsZW1lbnQsbz10LnJlY3QsYT10LmJ1dHRvbnM7aWYobyl7dmFyIHM9KDAsai5kZWZhdWx0KSh7fSxlLmNvb3Jkcy5jdXIucGFnZSksbD1uLm9wdGlvbnMucmVzaXplO2lmKGwmJmwuZW5hYmxlZCYmKCFlLnBvaW50ZXJJc0Rvd258fCEvbW91c2V8cG9pbnRlci8udGVzdChlLnBvaW50ZXJUeXBlKXx8MCE9KGEmbC5tb3VzZUJ1dHRvbnMpKSl7aWYoaS5kZWZhdWx0Lm9iamVjdChsLmVkZ2VzKSl7dmFyIHU9e2xlZnQ6ITEscmlnaHQ6ITEsdG9wOiExLGJvdHRvbTohMX07Zm9yKHZhciBjIGluIHUpdVtjXT1QdChjLGwuZWRnZXNbY10scyxlLl9sYXRlc3RQb2ludGVyLmV2ZW50VGFyZ2V0LHIsbyxsLm1hcmdpbnx8U3QuZGVmYXVsdE1hcmdpbik7dS5sZWZ0PXUubGVmdCYmIXUucmlnaHQsdS50b3A9dS50b3AmJiF1LmJvdHRvbSwodS5sZWZ0fHx1LnJpZ2h0fHx1LnRvcHx8dS5ib3R0b20pJiYodC5hY3Rpb249e25hbWU6XCJyZXNpemVcIixlZGdlczp1fSl9ZWxzZXt2YXIgZj1cInlcIiE9PWwuYXhpcyYmcy54Pm8ucmlnaHQtU3QuZGVmYXVsdE1hcmdpbixkPVwieFwiIT09bC5heGlzJiZzLnk+by5ib3R0b20tU3QuZGVmYXVsdE1hcmdpbjsoZnx8ZCkmJih0LmFjdGlvbj17bmFtZTpcInJlc2l6ZVwiLGF4ZXM6KGY/XCJ4XCI6XCJcIikrKGQ/XCJ5XCI6XCJcIil9KX1yZXR1cm4hdC5hY3Rpb24mJnZvaWQgMH19fX0sZGVmYXVsdHM6e3NxdWFyZTohMSxwcmVzZXJ2ZUFzcGVjdFJhdGlvOiExLGF4aXM6XCJ4eVwiLG1hcmdpbjpOYU4sZWRnZXM6bnVsbCxpbnZlcnQ6XCJub25lXCJ9LGN1cnNvcnM6bnVsbCxnZXRDdXJzb3I6ZnVuY3Rpb24odCl7dmFyIGU9dC5lZGdlcyxuPXQuYXhpcyxyPXQubmFtZSxvPVN0LmN1cnNvcnMsaT1udWxsO2lmKG4paT1vW3Irbl07ZWxzZSBpZihlKXtmb3IodmFyIGE9XCJcIixzPVtcInRvcFwiLFwiYm90dG9tXCIsXCJsZWZ0XCIsXCJyaWdodFwiXSxsPTA7bDxzLmxlbmd0aDtsKyspe3ZhciB1PXNbbF07ZVt1XSYmKGErPXUpfWk9b1thXX1yZXR1cm4gaX0sZGVmYXVsdE1hcmdpbjpudWxsfSxFdD1TdDtfdC5kZWZhdWx0PUV0O3ZhciBUdD17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoVHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksVHQuZGVmYXVsdD12b2lkIDA7dmFyIE10PXtpZDpcImFjdGlvbnNcIixpbnN0YWxsOmZ1bmN0aW9uKHQpe3QudXNlUGx1Z2luKG10LmRlZmF1bHQpLHQudXNlUGx1Z2luKF90LmRlZmF1bHQpLHQudXNlUGx1Z2luKGMuZGVmYXVsdCksdC51c2VQbHVnaW4odXQuZGVmYXVsdCl9fTtUdC5kZWZhdWx0PU10O3ZhciBqdD17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoanQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksanQuZGVmYXVsdD12b2lkIDA7dmFyIGt0LEl0LER0PTAsQXQ9e3JlcXVlc3Q6ZnVuY3Rpb24odCl7cmV0dXJuIGt0KHQpfSxjYW5jZWw6ZnVuY3Rpb24odCl7cmV0dXJuIEl0KHQpfSxpbml0OmZ1bmN0aW9uKHQpe2lmKGt0PXQucmVxdWVzdEFuaW1hdGlvbkZyYW1lLEl0PXQuY2FuY2VsQW5pbWF0aW9uRnJhbWUsIWt0KWZvcih2YXIgZT1bXCJtc1wiLFwibW96XCIsXCJ3ZWJraXRcIixcIm9cIl0sbj0wO248ZS5sZW5ndGg7bisrKXt2YXIgcj1lW25dO2t0PXRbXCJcIi5jb25jYXQocixcIlJlcXVlc3RBbmltYXRpb25GcmFtZVwiKV0sSXQ9dFtcIlwiLmNvbmNhdChyLFwiQ2FuY2VsQW5pbWF0aW9uRnJhbWVcIildfHx0W1wiXCIuY29uY2F0KHIsXCJDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcIildfWt0PWt0JiZrdC5iaW5kKHQpLEl0PUl0JiZJdC5iaW5kKHQpLGt0fHwoa3Q9ZnVuY3Rpb24oZSl7dmFyIG49RGF0ZS5ub3coKSxyPU1hdGgubWF4KDAsMTYtKG4tRHQpKSxvPXQuc2V0VGltZW91dCgoZnVuY3Rpb24oKXtlKG4rcil9KSxyKTtyZXR1cm4gRHQ9bityLG99LEl0PWZ1bmN0aW9uKHQpe3JldHVybiBjbGVhclRpbWVvdXQodCl9KX19O2p0LmRlZmF1bHQ9QXQ7dmFyIFJ0PXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShSdCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxSdC5nZXRDb250YWluZXI9Q3QsUnQuZ2V0U2Nyb2xsPUZ0LFJ0LmdldFNjcm9sbFNpemU9ZnVuY3Rpb24odCl7cmV0dXJuIGkuZGVmYXVsdC53aW5kb3codCkmJih0PXdpbmRvdy5kb2N1bWVudC5ib2R5KSx7eDp0LnNjcm9sbFdpZHRoLHk6dC5zY3JvbGxIZWlnaHR9fSxSdC5nZXRTY3JvbGxTaXplRGVsdGE9ZnVuY3Rpb24odCxlKXt2YXIgbj10LmludGVyYWN0aW9uLHI9dC5lbGVtZW50LG89biYmbi5pbnRlcmFjdGFibGUub3B0aW9uc1tuLnByZXBhcmVkLm5hbWVdLmF1dG9TY3JvbGw7aWYoIW98fCFvLmVuYWJsZWQpcmV0dXJuIGUoKSx7eDowLHk6MH07dmFyIGk9Q3Qoby5jb250YWluZXIsbi5pbnRlcmFjdGFibGUsciksYT1GdChpKTtlKCk7dmFyIHM9RnQoaSk7cmV0dXJue3g6cy54LWEueCx5OnMueS1hLnl9fSxSdC5kZWZhdWx0PXZvaWQgMDt2YXIgenQ9e2RlZmF1bHRzOntlbmFibGVkOiExLG1hcmdpbjo2MCxjb250YWluZXI6bnVsbCxzcGVlZDozMDB9LG5vdzpEYXRlLm5vdyxpbnRlcmFjdGlvbjpudWxsLGk6MCx4OjAseTowLGlzU2Nyb2xsaW5nOiExLHByZXZUaW1lOjAsbWFyZ2luOjAsc3BlZWQ6MCxzdGFydDpmdW5jdGlvbih0KXt6dC5pc1Njcm9sbGluZz0hMCxqdC5kZWZhdWx0LmNhbmNlbCh6dC5pKSx0LmF1dG9TY3JvbGw9enQsenQuaW50ZXJhY3Rpb249dCx6dC5wcmV2VGltZT16dC5ub3coKSx6dC5pPWp0LmRlZmF1bHQucmVxdWVzdCh6dC5zY3JvbGwpfSxzdG9wOmZ1bmN0aW9uKCl7enQuaXNTY3JvbGxpbmc9ITEsenQuaW50ZXJhY3Rpb24mJih6dC5pbnRlcmFjdGlvbi5hdXRvU2Nyb2xsPW51bGwpLGp0LmRlZmF1bHQuY2FuY2VsKHp0LmkpfSxzY3JvbGw6ZnVuY3Rpb24oKXt2YXIgdD16dC5pbnRlcmFjdGlvbixlPXQuaW50ZXJhY3RhYmxlLG49dC5lbGVtZW50LHI9dC5wcmVwYXJlZC5uYW1lLG89ZS5vcHRpb25zW3JdLmF1dG9TY3JvbGwsYT1DdChvLmNvbnRhaW5lcixlLG4pLHM9enQubm93KCksbD0ocy16dC5wcmV2VGltZSkvMWUzLHU9by5zcGVlZCpsO2lmKHU+PTEpe3ZhciBjPXt4Onp0LngqdSx5Onp0LnkqdX07aWYoYy54fHxjLnkpe3ZhciBmPUZ0KGEpO2kuZGVmYXVsdC53aW5kb3coYSk/YS5zY3JvbGxCeShjLngsYy55KTphJiYoYS5zY3JvbGxMZWZ0Kz1jLngsYS5zY3JvbGxUb3ArPWMueSk7dmFyIGQ9RnQoYSkscD17eDpkLngtZi54LHk6ZC55LWYueX07KHAueHx8cC55KSYmZS5maXJlKHt0eXBlOlwiYXV0b3Njcm9sbFwiLHRhcmdldDpuLGludGVyYWN0YWJsZTplLGRlbHRhOnAsaW50ZXJhY3Rpb246dCxjb250YWluZXI6YX0pfXp0LnByZXZUaW1lPXN9enQuaXNTY3JvbGxpbmcmJihqdC5kZWZhdWx0LmNhbmNlbCh6dC5pKSx6dC5pPWp0LmRlZmF1bHQucmVxdWVzdCh6dC5zY3JvbGwpKX0sY2hlY2s6ZnVuY3Rpb24odCxlKXt2YXIgbjtyZXR1cm4gbnVsbD09KG49dC5vcHRpb25zW2VdLmF1dG9TY3JvbGwpP3ZvaWQgMDpuLmVuYWJsZWR9LG9uSW50ZXJhY3Rpb25Nb3ZlOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24sbj10LnBvaW50ZXI7aWYoZS5pbnRlcmFjdGluZygpJiZ6dC5jaGVjayhlLmludGVyYWN0YWJsZSxlLnByZXBhcmVkLm5hbWUpKWlmKGUuc2ltdWxhdGlvbil6dC54PXp0Lnk9MDtlbHNle3ZhciByLG8sYSxzLGw9ZS5pbnRlcmFjdGFibGUsdT1lLmVsZW1lbnQsYz1lLnByZXBhcmVkLm5hbWUsZj1sLm9wdGlvbnNbY10uYXV0b1Njcm9sbCxkPUN0KGYuY29udGFpbmVyLGwsdSk7aWYoaS5kZWZhdWx0LndpbmRvdyhkKSlzPW4uY2xpZW50WDx6dC5tYXJnaW4scj1uLmNsaWVudFk8enQubWFyZ2luLG89bi5jbGllbnRYPmQuaW5uZXJXaWR0aC16dC5tYXJnaW4sYT1uLmNsaWVudFk+ZC5pbm5lckhlaWdodC16dC5tYXJnaW47ZWxzZXt2YXIgcD1fLmdldEVsZW1lbnRDbGllbnRSZWN0KGQpO3M9bi5jbGllbnRYPHAubGVmdCt6dC5tYXJnaW4scj1uLmNsaWVudFk8cC50b3ArenQubWFyZ2luLG89bi5jbGllbnRYPnAucmlnaHQtenQubWFyZ2luLGE9bi5jbGllbnRZPnAuYm90dG9tLXp0Lm1hcmdpbn16dC54PW8/MTpzPy0xOjAsenQueT1hPzE6cj8tMTowLHp0LmlzU2Nyb2xsaW5nfHwoenQubWFyZ2luPWYubWFyZ2luLHp0LnNwZWVkPWYuc3BlZWQsenQuc3RhcnQoZSkpfX19O2Z1bmN0aW9uIEN0KHQsbixyKXtyZXR1cm4oaS5kZWZhdWx0LnN0cmluZyh0KT8oMCxrLmdldFN0cmluZ09wdGlvblJlc3VsdCkodCxuLHIpOnQpfHwoMCxlLmdldFdpbmRvdykocil9ZnVuY3Rpb24gRnQodCl7cmV0dXJuIGkuZGVmYXVsdC53aW5kb3codCkmJih0PXdpbmRvdy5kb2N1bWVudC5ib2R5KSx7eDp0LnNjcm9sbExlZnQseTp0LnNjcm9sbFRvcH19dmFyIFh0PXtpZDpcImF1dG8tc2Nyb2xsXCIsaW5zdGFsbDpmdW5jdGlvbih0KXt2YXIgZT10LmRlZmF1bHRzLG49dC5hY3Rpb25zO3QuYXV0b1Njcm9sbD16dCx6dC5ub3c9ZnVuY3Rpb24oKXtyZXR1cm4gdC5ub3coKX0sbi5waGFzZWxlc3NUeXBlcy5hdXRvc2Nyb2xsPSEwLGUucGVyQWN0aW9uLmF1dG9TY3JvbGw9enQuZGVmYXVsdHN9LGxpc3RlbmVyczp7XCJpbnRlcmFjdGlvbnM6bmV3XCI6ZnVuY3Rpb24odCl7dC5pbnRlcmFjdGlvbi5hdXRvU2Nyb2xsPW51bGx9LFwiaW50ZXJhY3Rpb25zOmRlc3Ryb3lcIjpmdW5jdGlvbih0KXt0LmludGVyYWN0aW9uLmF1dG9TY3JvbGw9bnVsbCx6dC5zdG9wKCksenQuaW50ZXJhY3Rpb24mJih6dC5pbnRlcmFjdGlvbj1udWxsKX0sXCJpbnRlcmFjdGlvbnM6c3RvcFwiOnp0LnN0b3AsXCJpbnRlcmFjdGlvbnM6YWN0aW9uLW1vdmVcIjpmdW5jdGlvbih0KXtyZXR1cm4genQub25JbnRlcmFjdGlvbk1vdmUodCl9fX07UnQuZGVmYXVsdD1YdDt2YXIgWXQ9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KFl0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLFl0Lndhcm5PbmNlPWZ1bmN0aW9uKHQsbil7dmFyIHI9ITE7cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIHJ8fChlLndpbmRvdy5jb25zb2xlLndhcm4obikscj0hMCksdC5hcHBseSh0aGlzLGFyZ3VtZW50cyl9fSxZdC5jb3B5QWN0aW9uPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIHQubmFtZT1lLm5hbWUsdC5heGlzPWUuYXhpcyx0LmVkZ2VzPWUuZWRnZXMsdH0sWXQuc2lnbj12b2lkIDAsWXQuc2lnbj1mdW5jdGlvbih0KXtyZXR1cm4gdD49MD8xOi0xfTt2YXIgQnQ9e307ZnVuY3Rpb24gV3QodCl7cmV0dXJuIGkuZGVmYXVsdC5ib29sKHQpPyh0aGlzLm9wdGlvbnMuc3R5bGVDdXJzb3I9dCx0aGlzKTpudWxsPT09dD8oZGVsZXRlIHRoaXMub3B0aW9ucy5zdHlsZUN1cnNvcix0aGlzKTp0aGlzLm9wdGlvbnMuc3R5bGVDdXJzb3J9ZnVuY3Rpb24gTHQodCl7cmV0dXJuIGkuZGVmYXVsdC5mdW5jKHQpPyh0aGlzLm9wdGlvbnMuYWN0aW9uQ2hlY2tlcj10LHRoaXMpOm51bGw9PT10PyhkZWxldGUgdGhpcy5vcHRpb25zLmFjdGlvbkNoZWNrZXIsdGhpcyk6dGhpcy5vcHRpb25zLmFjdGlvbkNoZWNrZXJ9T2JqZWN0LmRlZmluZVByb3BlcnR5KEJ0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLEJ0LmRlZmF1bHQ9dm9pZCAwO3ZhciBVdD17aWQ6XCJhdXRvLXN0YXJ0L2ludGVyYWN0YWJsZU1ldGhvZHNcIixpbnN0YWxsOmZ1bmN0aW9uKHQpe3ZhciBlPXQuSW50ZXJhY3RhYmxlO2UucHJvdG90eXBlLmdldEFjdGlvbj1mdW5jdGlvbihlLG4scixvKXt2YXIgaT1mdW5jdGlvbih0LGUsbixyLG8pe3ZhciBpPXQuZ2V0UmVjdChyKSxhPXthY3Rpb246bnVsbCxpbnRlcmFjdGFibGU6dCxpbnRlcmFjdGlvbjpuLGVsZW1lbnQ6cixyZWN0OmksYnV0dG9uczplLmJ1dHRvbnN8fHswOjEsMTo0LDM6OCw0OjE2fVtlLmJ1dHRvbl19O3JldHVybiBvLmZpcmUoXCJhdXRvLXN0YXJ0OmNoZWNrXCIsYSksYS5hY3Rpb259KHRoaXMsbixyLG8sdCk7cmV0dXJuIHRoaXMub3B0aW9ucy5hY3Rpb25DaGVja2VyP3RoaXMub3B0aW9ucy5hY3Rpb25DaGVja2VyKGUsbixpLHRoaXMsbyxyKTppfSxlLnByb3RvdHlwZS5pZ25vcmVGcm9tPSgwLFl0Lndhcm5PbmNlKSgoZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuX2JhY2tDb21wYXRPcHRpb24oXCJpZ25vcmVGcm9tXCIsdCl9KSxcIkludGVyYWN0YWJsZS5pZ25vcmVGcm9tKCkgaGFzIGJlZW4gZGVwcmVjYXRlZC4gVXNlIEludGVyYWN0YmxlLmRyYWdnYWJsZSh7aWdub3JlRnJvbTogbmV3VmFsdWV9KS5cIiksZS5wcm90b3R5cGUuYWxsb3dGcm9tPSgwLFl0Lndhcm5PbmNlKSgoZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuX2JhY2tDb21wYXRPcHRpb24oXCJhbGxvd0Zyb21cIix0KX0pLFwiSW50ZXJhY3RhYmxlLmFsbG93RnJvbSgpIGhhcyBiZWVuIGRlcHJlY2F0ZWQuIFVzZSBJbnRlcmFjdGJsZS5kcmFnZ2FibGUoe2FsbG93RnJvbTogbmV3VmFsdWV9KS5cIiksZS5wcm90b3R5cGUuYWN0aW9uQ2hlY2tlcj1MdCxlLnByb3RvdHlwZS5zdHlsZUN1cnNvcj1XdH19O0J0LmRlZmF1bHQ9VXQ7dmFyIFZ0PXt9O2Z1bmN0aW9uIE50KHQsZSxuLHIsbyl7cmV0dXJuIGUudGVzdElnbm9yZUFsbG93KGUub3B0aW9uc1t0Lm5hbWVdLG4scikmJmUub3B0aW9uc1t0Lm5hbWVdLmVuYWJsZWQmJkh0KGUsbix0LG8pP3Q6bnVsbH1mdW5jdGlvbiBxdCh0LGUsbixyLG8saSxhKXtmb3IodmFyIHM9MCxsPXIubGVuZ3RoO3M8bDtzKyspe3ZhciB1PXJbc10sYz1vW3NdLGY9dS5nZXRBY3Rpb24oZSxuLHQsYyk7aWYoZil7dmFyIGQ9TnQoZix1LGMsaSxhKTtpZihkKXJldHVybnthY3Rpb246ZCxpbnRlcmFjdGFibGU6dSxlbGVtZW50OmN9fX1yZXR1cm57YWN0aW9uOm51bGwsaW50ZXJhY3RhYmxlOm51bGwsZWxlbWVudDpudWxsfX1mdW5jdGlvbiAkdCh0LGUsbixyLG8pe3ZhciBhPVtdLHM9W10sbD1yO2Z1bmN0aW9uIHUodCl7YS5wdXNoKHQpLHMucHVzaChsKX1mb3IoO2kuZGVmYXVsdC5lbGVtZW50KGwpOyl7YT1bXSxzPVtdLG8uaW50ZXJhY3RhYmxlcy5mb3JFYWNoTWF0Y2gobCx1KTt2YXIgYz1xdCh0LGUsbixhLHMscixvKTtpZihjLmFjdGlvbiYmIWMuaW50ZXJhY3RhYmxlLm9wdGlvbnNbYy5hY3Rpb24ubmFtZV0ubWFudWFsU3RhcnQpcmV0dXJuIGM7bD1fLnBhcmVudE5vZGUobCl9cmV0dXJue2FjdGlvbjpudWxsLGludGVyYWN0YWJsZTpudWxsLGVsZW1lbnQ6bnVsbH19ZnVuY3Rpb24gR3QodCxlLG4pe3ZhciByPWUuYWN0aW9uLG89ZS5pbnRlcmFjdGFibGUsaT1lLmVsZW1lbnQ7cj1yfHx7bmFtZTpudWxsfSx0LmludGVyYWN0YWJsZT1vLHQuZWxlbWVudD1pLCgwLFl0LmNvcHlBY3Rpb24pKHQucHJlcGFyZWQsciksdC5yZWN0PW8mJnIubmFtZT9vLmdldFJlY3QoaSk6bnVsbCxKdCh0LG4pLG4uZmlyZShcImF1dG9TdGFydDpwcmVwYXJlZFwiLHtpbnRlcmFjdGlvbjp0fSl9ZnVuY3Rpb24gSHQodCxlLG4scil7dmFyIG89dC5vcHRpb25zLGk9b1tuLm5hbWVdLm1heCxhPW9bbi5uYW1lXS5tYXhQZXJFbGVtZW50LHM9ci5hdXRvU3RhcnQubWF4SW50ZXJhY3Rpb25zLGw9MCx1PTAsYz0wO2lmKCEoaSYmYSYmcykpcmV0dXJuITE7Zm9yKHZhciBmPTA7ZjxyLmludGVyYWN0aW9ucy5saXN0Lmxlbmd0aDtmKyspe3ZhciBkPXIuaW50ZXJhY3Rpb25zLmxpc3RbZl0scD1kLnByZXBhcmVkLm5hbWU7aWYoZC5pbnRlcmFjdGluZygpKXtpZigrK2w+PXMpcmV0dXJuITE7aWYoZC5pbnRlcmFjdGFibGU9PT10KXtpZigodSs9cD09PW4ubmFtZT8xOjApPj1pKXJldHVybiExO2lmKGQuZWxlbWVudD09PWUmJihjKysscD09PW4ubmFtZSYmYz49YSkpcmV0dXJuITF9fX1yZXR1cm4gcz4wfWZ1bmN0aW9uIEt0KHQsZSl7cmV0dXJuIGkuZGVmYXVsdC5udW1iZXIodCk/KGUuYXV0b1N0YXJ0Lm1heEludGVyYWN0aW9ucz10LHRoaXMpOmUuYXV0b1N0YXJ0Lm1heEludGVyYWN0aW9uc31mdW5jdGlvbiBadCh0LGUsbil7dmFyIHI9bi5hdXRvU3RhcnQuY3Vyc29yRWxlbWVudDtyJiZyIT09dCYmKHIuc3R5bGUuY3Vyc29yPVwiXCIpLHQub3duZXJEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuY3Vyc29yPWUsdC5zdHlsZS5jdXJzb3I9ZSxuLmF1dG9TdGFydC5jdXJzb3JFbGVtZW50PWU/dDpudWxsfWZ1bmN0aW9uIEp0KHQsZSl7dmFyIG49dC5pbnRlcmFjdGFibGUscj10LmVsZW1lbnQsbz10LnByZXBhcmVkO2lmKFwibW91c2VcIj09PXQucG9pbnRlclR5cGUmJm4mJm4ub3B0aW9ucy5zdHlsZUN1cnNvcil7dmFyIGE9XCJcIjtpZihvLm5hbWUpe3ZhciBzPW4ub3B0aW9uc1tvLm5hbWVdLmN1cnNvckNoZWNrZXI7YT1pLmRlZmF1bHQuZnVuYyhzKT9zKG8sbixyLHQuX2ludGVyYWN0aW5nKTplLmFjdGlvbnMubWFwW28ubmFtZV0uZ2V0Q3Vyc29yKG8pfVp0KHQuZWxlbWVudCxhfHxcIlwiLGUpfWVsc2UgZS5hdXRvU3RhcnQuY3Vyc29yRWxlbWVudCYmWnQoZS5hdXRvU3RhcnQuY3Vyc29yRWxlbWVudCxcIlwiLGUpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShWdCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxWdC5kZWZhdWx0PXZvaWQgMDt2YXIgUXQ9e2lkOlwiYXV0by1zdGFydC9iYXNlXCIsYmVmb3JlOltcImFjdGlvbnNcIl0saW5zdGFsbDpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0U3RhdGljLG49dC5kZWZhdWx0czt0LnVzZVBsdWdpbihCdC5kZWZhdWx0KSxuLmJhc2UuYWN0aW9uQ2hlY2tlcj1udWxsLG4uYmFzZS5zdHlsZUN1cnNvcj0hMCwoMCxqLmRlZmF1bHQpKG4ucGVyQWN0aW9uLHttYW51YWxTdGFydDohMSxtYXg6MS8wLG1heFBlckVsZW1lbnQ6MSxhbGxvd0Zyb206bnVsbCxpZ25vcmVGcm9tOm51bGwsbW91c2VCdXR0b25zOjF9KSxlLm1heEludGVyYWN0aW9ucz1mdW5jdGlvbihlKXtyZXR1cm4gS3QoZSx0KX0sdC5hdXRvU3RhcnQ9e21heEludGVyYWN0aW9uczoxLzAsd2l0aGluSW50ZXJhY3Rpb25MaW1pdDpIdCxjdXJzb3JFbGVtZW50Om51bGx9fSxsaXN0ZW5lcnM6e1wiaW50ZXJhY3Rpb25zOmRvd25cIjpmdW5jdGlvbih0LGUpe3ZhciBuPXQuaW50ZXJhY3Rpb24scj10LnBvaW50ZXIsbz10LmV2ZW50LGk9dC5ldmVudFRhcmdldDtuLmludGVyYWN0aW5nKCl8fEd0KG4sJHQobixyLG8saSxlKSxlKX0sXCJpbnRlcmFjdGlvbnM6bW92ZVwiOmZ1bmN0aW9uKHQsZSl7IWZ1bmN0aW9uKHQsZSl7dmFyIG49dC5pbnRlcmFjdGlvbixyPXQucG9pbnRlcixvPXQuZXZlbnQsaT10LmV2ZW50VGFyZ2V0O1wibW91c2VcIiE9PW4ucG9pbnRlclR5cGV8fG4ucG9pbnRlcklzRG93bnx8bi5pbnRlcmFjdGluZygpfHxHdChuLCR0KG4scixvLGksZSksZSl9KHQsZSksZnVuY3Rpb24odCxlKXt2YXIgbj10LmludGVyYWN0aW9uO2lmKG4ucG9pbnRlcklzRG93biYmIW4uaW50ZXJhY3RpbmcoKSYmbi5wb2ludGVyV2FzTW92ZWQmJm4ucHJlcGFyZWQubmFtZSl7ZS5maXJlKFwiYXV0b1N0YXJ0OmJlZm9yZS1zdGFydFwiLHQpO3ZhciByPW4uaW50ZXJhY3RhYmxlLG89bi5wcmVwYXJlZC5uYW1lO28mJnImJihyLm9wdGlvbnNbb10ubWFudWFsU3RhcnR8fCFIdChyLG4uZWxlbWVudCxuLnByZXBhcmVkLGUpP24uc3RvcCgpOihuLnN0YXJ0KG4ucHJlcGFyZWQscixuLmVsZW1lbnQpLEp0KG4sZSkpKX19KHQsZSl9LFwiaW50ZXJhY3Rpb25zOnN0b3BcIjpmdW5jdGlvbih0LGUpe3ZhciBuPXQuaW50ZXJhY3Rpb24scj1uLmludGVyYWN0YWJsZTtyJiZyLm9wdGlvbnMuc3R5bGVDdXJzb3ImJlp0KG4uZWxlbWVudCxcIlwiLGUpfX0sbWF4SW50ZXJhY3Rpb25zOkt0LHdpdGhpbkludGVyYWN0aW9uTGltaXQ6SHQsdmFsaWRhdGVBY3Rpb246TnR9O1Z0LmRlZmF1bHQ9UXQ7dmFyIHRlPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0ZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0ZS5kZWZhdWx0PXZvaWQgMDt2YXIgZWU9e2lkOlwiYXV0by1zdGFydC9kcmFnQXhpc1wiLGxpc3RlbmVyczp7XCJhdXRvU3RhcnQ6YmVmb3JlLXN0YXJ0XCI6ZnVuY3Rpb24odCxlKXt2YXIgbj10LmludGVyYWN0aW9uLHI9dC5ldmVudFRhcmdldCxvPXQuZHgsYT10LmR5O2lmKFwiZHJhZ1wiPT09bi5wcmVwYXJlZC5uYW1lKXt2YXIgcz1NYXRoLmFicyhvKSxsPU1hdGguYWJzKGEpLHU9bi5pbnRlcmFjdGFibGUub3B0aW9ucy5kcmFnLGM9dS5zdGFydEF4aXMsZj1zPmw/XCJ4XCI6czxsP1wieVwiOlwieHlcIjtpZihuLnByZXBhcmVkLmF4aXM9XCJzdGFydFwiPT09dS5sb2NrQXhpcz9mWzBdOnUubG9ja0F4aXMsXCJ4eVwiIT09ZiYmXCJ4eVwiIT09YyYmYyE9PWYpe24ucHJlcGFyZWQubmFtZT1udWxsO2Zvcih2YXIgZD1yLHA9ZnVuY3Rpb24odCl7aWYodCE9PW4uaW50ZXJhY3RhYmxlKXt2YXIgbz1uLmludGVyYWN0YWJsZS5vcHRpb25zLmRyYWc7aWYoIW8ubWFudWFsU3RhcnQmJnQudGVzdElnbm9yZUFsbG93KG8sZCxyKSl7dmFyIGk9dC5nZXRBY3Rpb24obi5kb3duUG9pbnRlcixuLmRvd25FdmVudCxuLGQpO2lmKGkmJlwiZHJhZ1wiPT09aS5uYW1lJiZmdW5jdGlvbih0LGUpe2lmKCFlKXJldHVybiExO3ZhciBuPWUub3B0aW9ucy5kcmFnLnN0YXJ0QXhpcztyZXR1cm5cInh5XCI9PT10fHxcInh5XCI9PT1ufHxuPT09dH0oZix0KSYmVnQuZGVmYXVsdC52YWxpZGF0ZUFjdGlvbihpLHQsZCxyLGUpKXJldHVybiB0fX19O2kuZGVmYXVsdC5lbGVtZW50KGQpOyl7dmFyIHY9ZS5pbnRlcmFjdGFibGVzLmZvckVhY2hNYXRjaChkLHApO2lmKHYpe24ucHJlcGFyZWQubmFtZT1cImRyYWdcIixuLmludGVyYWN0YWJsZT12LG4uZWxlbWVudD1kO2JyZWFrfWQ9KDAsXy5wYXJlbnROb2RlKShkKX19fX19fTt0ZS5kZWZhdWx0PWVlO3ZhciBuZT17fTtmdW5jdGlvbiByZSh0KXt2YXIgZT10LnByZXBhcmVkJiZ0LnByZXBhcmVkLm5hbWU7aWYoIWUpcmV0dXJuIG51bGw7dmFyIG49dC5pbnRlcmFjdGFibGUub3B0aW9ucztyZXR1cm4gbltlXS5ob2xkfHxuW2VdLmRlbGF5fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShuZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxuZS5kZWZhdWx0PXZvaWQgMDt2YXIgb2U9e2lkOlwiYXV0by1zdGFydC9ob2xkXCIsaW5zdGFsbDpmdW5jdGlvbih0KXt2YXIgZT10LmRlZmF1bHRzO3QudXNlUGx1Z2luKFZ0LmRlZmF1bHQpLGUucGVyQWN0aW9uLmhvbGQ9MCxlLnBlckFjdGlvbi5kZWxheT0wfSxsaXN0ZW5lcnM6e1wiaW50ZXJhY3Rpb25zOm5ld1wiOmZ1bmN0aW9uKHQpe3QuaW50ZXJhY3Rpb24uYXV0b1N0YXJ0SG9sZFRpbWVyPW51bGx9LFwiYXV0b1N0YXJ0OnByZXBhcmVkXCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbixuPXJlKGUpO24+MCYmKGUuYXV0b1N0YXJ0SG9sZFRpbWVyPXNldFRpbWVvdXQoKGZ1bmN0aW9uKCl7ZS5zdGFydChlLnByZXBhcmVkLGUuaW50ZXJhY3RhYmxlLGUuZWxlbWVudCl9KSxuKSl9LFwiaW50ZXJhY3Rpb25zOm1vdmVcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uLG49dC5kdXBsaWNhdGU7ZS5hdXRvU3RhcnRIb2xkVGltZXImJmUucG9pbnRlcldhc01vdmVkJiYhbiYmKGNsZWFyVGltZW91dChlLmF1dG9TdGFydEhvbGRUaW1lciksZS5hdXRvU3RhcnRIb2xkVGltZXI9bnVsbCl9LFwiYXV0b1N0YXJ0OmJlZm9yZS1zdGFydFwiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb247cmUoZSk+MCYmKGUucHJlcGFyZWQubmFtZT1udWxsKX19LGdldEhvbGREdXJhdGlvbjpyZX07bmUuZGVmYXVsdD1vZTt2YXIgaWU9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGllLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGllLmRlZmF1bHQ9dm9pZCAwO3ZhciBhZT17aWQ6XCJhdXRvLXN0YXJ0XCIsaW5zdGFsbDpmdW5jdGlvbih0KXt0LnVzZVBsdWdpbihWdC5kZWZhdWx0KSx0LnVzZVBsdWdpbihuZS5kZWZhdWx0KSx0LnVzZVBsdWdpbih0ZS5kZWZhdWx0KX19O2llLmRlZmF1bHQ9YWU7dmFyIHNlPXt9O2Z1bmN0aW9uIGxlKHQpe3JldHVybi9eKGFsd2F5c3xuZXZlcnxhdXRvKSQvLnRlc3QodCk/KHRoaXMub3B0aW9ucy5wcmV2ZW50RGVmYXVsdD10LHRoaXMpOmkuZGVmYXVsdC5ib29sKHQpPyh0aGlzLm9wdGlvbnMucHJldmVudERlZmF1bHQ9dD9cImFsd2F5c1wiOlwibmV2ZXJcIix0aGlzKTp0aGlzLm9wdGlvbnMucHJldmVudERlZmF1bHR9ZnVuY3Rpb24gdWUodCl7dmFyIGU9dC5pbnRlcmFjdGlvbixuPXQuZXZlbnQ7ZS5pbnRlcmFjdGFibGUmJmUuaW50ZXJhY3RhYmxlLmNoZWNrQW5kUHJldmVudERlZmF1bHQobil9ZnVuY3Rpb24gY2UodCl7dmFyIG49dC5JbnRlcmFjdGFibGU7bi5wcm90b3R5cGUucHJldmVudERlZmF1bHQ9bGUsbi5wcm90b3R5cGUuY2hlY2tBbmRQcmV2ZW50RGVmYXVsdD1mdW5jdGlvbihuKXtyZXR1cm4gZnVuY3Rpb24odCxuLHIpe3ZhciBvPXQub3B0aW9ucy5wcmV2ZW50RGVmYXVsdDtpZihcIm5ldmVyXCIhPT1vKWlmKFwiYWx3YXlzXCIhPT1vKXtpZihuLmV2ZW50cy5zdXBwb3J0c1Bhc3NpdmUmJi9edG91Y2goc3RhcnR8bW92ZSkkLy50ZXN0KHIudHlwZSkpe3ZhciBhPSgwLGUuZ2V0V2luZG93KShyLnRhcmdldCkuZG9jdW1lbnQscz1uLmdldERvY09wdGlvbnMoYSk7aWYoIXN8fCFzLmV2ZW50c3x8ITEhPT1zLmV2ZW50cy5wYXNzaXZlKXJldHVybn0vXihtb3VzZXxwb2ludGVyfHRvdWNoKSooZG93bnxzdGFydCkvaS50ZXN0KHIudHlwZSl8fGkuZGVmYXVsdC5lbGVtZW50KHIudGFyZ2V0KSYmKDAsXy5tYXRjaGVzU2VsZWN0b3IpKHIudGFyZ2V0LFwiaW5wdXQsc2VsZWN0LHRleHRhcmVhLFtjb250ZW50ZWRpdGFibGU9dHJ1ZV0sW2NvbnRlbnRlZGl0YWJsZT10cnVlXSAqXCIpfHxyLnByZXZlbnREZWZhdWx0KCl9ZWxzZSByLnByZXZlbnREZWZhdWx0KCl9KHRoaXMsdCxuKX0sdC5pbnRlcmFjdGlvbnMuZG9jRXZlbnRzLnB1c2goe3R5cGU6XCJkcmFnc3RhcnRcIixsaXN0ZW5lcjpmdW5jdGlvbihlKXtmb3IodmFyIG49MDtuPHQuaW50ZXJhY3Rpb25zLmxpc3QubGVuZ3RoO24rKyl7dmFyIHI9dC5pbnRlcmFjdGlvbnMubGlzdFtuXTtpZihyLmVsZW1lbnQmJihyLmVsZW1lbnQ9PT1lLnRhcmdldHx8KDAsXy5ub2RlQ29udGFpbnMpKHIuZWxlbWVudCxlLnRhcmdldCkpKXJldHVybiB2b2lkIHIuaW50ZXJhY3RhYmxlLmNoZWNrQW5kUHJldmVudERlZmF1bHQoZSl9fX0pfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxzZS5pbnN0YWxsPWNlLHNlLmRlZmF1bHQ9dm9pZCAwO3ZhciBmZT17aWQ6XCJjb3JlL2ludGVyYWN0YWJsZVByZXZlbnREZWZhdWx0XCIsaW5zdGFsbDpjZSxsaXN0ZW5lcnM6W1wiZG93blwiLFwibW92ZVwiLFwidXBcIixcImNhbmNlbFwiXS5yZWR1Y2UoKGZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRbXCJpbnRlcmFjdGlvbnM6XCIuY29uY2F0KGUpXT11ZSx0fSkse30pfTtzZS5kZWZhdWx0PWZlO3ZhciBkZT17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoZGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksZGUuZGVmYXVsdD12b2lkIDAsZGUuZGVmYXVsdD17fTt2YXIgcGUsdmU9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KHZlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHZlLmRlZmF1bHQ9dm9pZCAwLGZ1bmN0aW9uKHQpe3QudG91Y2hBY3Rpb249XCJ0b3VjaEFjdGlvblwiLHQuYm94U2l6aW5nPVwiYm94U2l6aW5nXCIsdC5ub0xpc3RlbmVycz1cIm5vTGlzdGVuZXJzXCJ9KHBlfHwocGU9e30pKTtwZS50b3VjaEFjdGlvbixwZS5ib3hTaXppbmcscGUubm9MaXN0ZW5lcnM7dmFyIGhlPXtpZDpcImRldi10b29sc1wiLGluc3RhbGw6ZnVuY3Rpb24oKXt9fTt2ZS5kZWZhdWx0PWhlO3ZhciBnZT17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoZ2UsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksZ2UuZGVmYXVsdD1mdW5jdGlvbiB0KGUpe3ZhciBuPXt9O2Zvcih2YXIgciBpbiBlKXt2YXIgbz1lW3JdO2kuZGVmYXVsdC5wbGFpbk9iamVjdChvKT9uW3JdPXQobyk6aS5kZWZhdWx0LmFycmF5KG8pP25bcl09Wi5mcm9tKG8pOm5bcl09b31yZXR1cm4gbn07dmFyIHllPXt9O2Z1bmN0aW9uIG1lKHQsZSl7cmV0dXJuIGZ1bmN0aW9uKHQpe2lmKEFycmF5LmlzQXJyYXkodCkpcmV0dXJuIHR9KHQpfHxmdW5jdGlvbih0LGUpe2lmKFwidW5kZWZpbmVkXCIhPXR5cGVvZiBTeW1ib2wmJlN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QodCkpe3ZhciBuPVtdLHI9ITAsbz0hMSxpPXZvaWQgMDt0cnl7Zm9yKHZhciBhLHM9dFtTeW1ib2wuaXRlcmF0b3JdKCk7IShyPShhPXMubmV4dCgpKS5kb25lKSYmKG4ucHVzaChhLnZhbHVlKSwhZXx8bi5sZW5ndGghPT1lKTtyPSEwKTt9Y2F0Y2godCl7bz0hMCxpPXR9ZmluYWxseXt0cnl7cnx8bnVsbD09cy5yZXR1cm58fHMucmV0dXJuKCl9ZmluYWxseXtpZihvKXRocm93IGl9fXJldHVybiBufX0odCxlKXx8ZnVuY3Rpb24odCxlKXtpZih0KXtpZihcInN0cmluZ1wiPT10eXBlb2YgdClyZXR1cm4gYmUodCxlKTt2YXIgbj1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodCkuc2xpY2UoOCwtMSk7cmV0dXJuXCJPYmplY3RcIj09PW4mJnQuY29uc3RydWN0b3ImJihuPXQuY29uc3RydWN0b3IubmFtZSksXCJNYXBcIj09PW58fFwiU2V0XCI9PT1uP0FycmF5LmZyb20odCk6XCJBcmd1bWVudHNcIj09PW58fC9eKD86VWl8SSludCg/Ojh8MTZ8MzIpKD86Q2xhbXBlZCk/QXJyYXkkLy50ZXN0KG4pP2JlKHQsZSk6dm9pZCAwfX0odCxlKXx8ZnVuY3Rpb24oKXt0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZS5cXG5JbiBvcmRlciB0byBiZSBpdGVyYWJsZSwgbm9uLWFycmF5IG9iamVjdHMgbXVzdCBoYXZlIGEgW1N5bWJvbC5pdGVyYXRvcl0oKSBtZXRob2QuXCIpfSgpfWZ1bmN0aW9uIGJlKHQsZSl7KG51bGw9PWV8fGU+dC5sZW5ndGgpJiYoZT10Lmxlbmd0aCk7Zm9yKHZhciBuPTAscj1BcnJheShlKTtuPGU7bisrKXJbbl09dFtuXTtyZXR1cm4gcn1mdW5jdGlvbiB4ZSh0LGUpe2Zvcih2YXIgbj0wO248ZS5sZW5ndGg7bisrKXt2YXIgcj1lW25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkodCxyLmtleSxyKX19ZnVuY3Rpb24gd2UodCxlLG4pe3JldHVybiBlIGluIHQ/T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsZSx7dmFsdWU6bixlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMH0pOnRbZV09bix0fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh5ZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx5ZS5nZXRSZWN0T2Zmc2V0PU9lLHllLmRlZmF1bHQ9dm9pZCAwO3ZhciBfZT1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoZSl7IWZ1bmN0aW9uKHQsZSl7aWYoISh0IGluc3RhbmNlb2YgZSkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX0odGhpcyx0KSx3ZSh0aGlzLFwic3RhdGVzXCIsW10pLHdlKHRoaXMsXCJzdGFydE9mZnNldFwiLHtsZWZ0OjAscmlnaHQ6MCx0b3A6MCxib3R0b206MH0pLHdlKHRoaXMsXCJzdGFydERlbHRhXCIsdm9pZCAwKSx3ZSh0aGlzLFwicmVzdWx0XCIsdm9pZCAwKSx3ZSh0aGlzLFwiZW5kUmVzdWx0XCIsdm9pZCAwKSx3ZSh0aGlzLFwiZWRnZXNcIix2b2lkIDApLHdlKHRoaXMsXCJpbnRlcmFjdGlvblwiLHZvaWQgMCksdGhpcy5pbnRlcmFjdGlvbj1lLHRoaXMucmVzdWx0PVBlKCl9dmFyIGUsbjtyZXR1cm4gZT10LChuPVt7a2V5Olwic3RhcnRcIix2YWx1ZTpmdW5jdGlvbih0LGUpe3ZhciBuPXQucGhhc2Uscj10aGlzLmludGVyYWN0aW9uLG89ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGFibGUub3B0aW9uc1t0LnByZXBhcmVkLm5hbWVdLG49ZS5tb2RpZmllcnM7cmV0dXJuIG4mJm4ubGVuZ3RoP246W1wic25hcFwiLFwic25hcFNpemVcIixcInNuYXBFZGdlc1wiLFwicmVzdHJpY3RcIixcInJlc3RyaWN0RWRnZXNcIixcInJlc3RyaWN0U2l6ZVwiXS5tYXAoKGZ1bmN0aW9uKHQpe3ZhciBuPWVbdF07cmV0dXJuIG4mJm4uZW5hYmxlZCYme29wdGlvbnM6bixtZXRob2RzOm4uX21ldGhvZHN9fSkpLmZpbHRlcigoZnVuY3Rpb24odCl7cmV0dXJuISF0fSkpfShyKTt0aGlzLnByZXBhcmVTdGF0ZXMobyksdGhpcy5lZGdlcz0oMCxqLmRlZmF1bHQpKHt9LHIuZWRnZXMpLHRoaXMuc3RhcnRPZmZzZXQ9T2Uoci5yZWN0LGUpLHRoaXMuc3RhcnREZWx0YT17eDowLHk6MH07dmFyIGk9dGhpcy5maWxsQXJnKHtwaGFzZTpuLHBhZ2VDb29yZHM6ZSxwcmVFbmQ6ITF9KTtyZXR1cm4gdGhpcy5yZXN1bHQ9UGUoKSx0aGlzLnN0YXJ0QWxsKGkpLHRoaXMucmVzdWx0PXRoaXMuc2V0QWxsKGkpfX0se2tleTpcImZpbGxBcmdcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10aGlzLmludGVyYWN0aW9uO3JldHVybiB0LmludGVyYWN0aW9uPWUsdC5pbnRlcmFjdGFibGU9ZS5pbnRlcmFjdGFibGUsdC5lbGVtZW50PWUuZWxlbWVudCx0LnJlY3Q9dC5yZWN0fHxlLnJlY3QsdC5lZGdlcz10aGlzLmVkZ2VzLHQuc3RhcnRPZmZzZXQ9dGhpcy5zdGFydE9mZnNldCx0fX0se2tleTpcInN0YXJ0QWxsXCIsdmFsdWU6ZnVuY3Rpb24odCl7Zm9yKHZhciBlPTA7ZTx0aGlzLnN0YXRlcy5sZW5ndGg7ZSsrKXt2YXIgbj10aGlzLnN0YXRlc1tlXTtuLm1ldGhvZHMuc3RhcnQmJih0LnN0YXRlPW4sbi5tZXRob2RzLnN0YXJ0KHQpKX19fSx7a2V5Olwic2V0QWxsXCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dC5waGFzZSxuPXQucHJlRW5kLHI9dC5za2lwTW9kaWZpZXJzLG89dC5yZWN0O3QuY29vcmRzPSgwLGouZGVmYXVsdCkoe30sdC5wYWdlQ29vcmRzKSx0LnJlY3Q9KDAsai5kZWZhdWx0KSh7fSxvKTtmb3IodmFyIGk9cj90aGlzLnN0YXRlcy5zbGljZShyKTp0aGlzLnN0YXRlcyxhPVBlKHQuY29vcmRzLHQucmVjdCkscz0wO3M8aS5sZW5ndGg7cysrKXt2YXIgbCx1PWlbc10sYz11Lm9wdGlvbnMsZj0oMCxqLmRlZmF1bHQpKHt9LHQuY29vcmRzKSxkPW51bGw7bnVsbCE9KGw9dS5tZXRob2RzKSYmbC5zZXQmJnRoaXMuc2hvdWxkRG8oYyxuLGUpJiYodC5zdGF0ZT11LGQ9dS5tZXRob2RzLnNldCh0KSxrLmFkZEVkZ2VzKHRoaXMuaW50ZXJhY3Rpb24uZWRnZXMsdC5yZWN0LHt4OnQuY29vcmRzLngtZi54LHk6dC5jb29yZHMueS1mLnl9KSksYS5ldmVudFByb3BzLnB1c2goZCl9YS5kZWx0YS54PXQuY29vcmRzLngtdC5wYWdlQ29vcmRzLngsYS5kZWx0YS55PXQuY29vcmRzLnktdC5wYWdlQ29vcmRzLnksYS5yZWN0RGVsdGEubGVmdD10LnJlY3QubGVmdC1vLmxlZnQsYS5yZWN0RGVsdGEucmlnaHQ9dC5yZWN0LnJpZ2h0LW8ucmlnaHQsYS5yZWN0RGVsdGEudG9wPXQucmVjdC50b3Atby50b3AsYS5yZWN0RGVsdGEuYm90dG9tPXQucmVjdC5ib3R0b20tby5ib3R0b207dmFyIHA9dGhpcy5yZXN1bHQuY29vcmRzLHY9dGhpcy5yZXN1bHQucmVjdDtpZihwJiZ2KXt2YXIgaD1hLnJlY3QubGVmdCE9PXYubGVmdHx8YS5yZWN0LnJpZ2h0IT09di5yaWdodHx8YS5yZWN0LnRvcCE9PXYudG9wfHxhLnJlY3QuYm90dG9tIT09di5ib3R0b207YS5jaGFuZ2VkPWh8fHAueCE9PWEuY29vcmRzLnh8fHAueSE9PWEuY29vcmRzLnl9cmV0dXJuIGF9fSx7a2V5OlwiYXBwbHlUb0ludGVyYWN0aW9uXCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5pbnRlcmFjdGlvbixuPXQucGhhc2Uscj1lLmNvb3Jkcy5jdXIsbz1lLmNvb3Jkcy5zdGFydCxpPXRoaXMucmVzdWx0LGE9dGhpcy5zdGFydERlbHRhLHM9aS5kZWx0YTtcInN0YXJ0XCI9PT1uJiYoMCxqLmRlZmF1bHQpKHRoaXMuc3RhcnREZWx0YSxpLmRlbHRhKTtmb3IodmFyIGw9MDtsPFtbbyxhXSxbcixzXV0ubGVuZ3RoO2wrKyl7dmFyIHU9bWUoW1tvLGFdLFtyLHNdXVtsXSwyKSxjPXVbMF0sZj11WzFdO2MucGFnZS54Kz1mLngsYy5wYWdlLnkrPWYueSxjLmNsaWVudC54Kz1mLngsYy5jbGllbnQueSs9Zi55fXZhciBkPXRoaXMucmVzdWx0LnJlY3REZWx0YSxwPXQucmVjdHx8ZS5yZWN0O3AubGVmdCs9ZC5sZWZ0LHAucmlnaHQrPWQucmlnaHQscC50b3ArPWQudG9wLHAuYm90dG9tKz1kLmJvdHRvbSxwLndpZHRoPXAucmlnaHQtcC5sZWZ0LHAuaGVpZ2h0PXAuYm90dG9tLXAudG9wfX0se2tleTpcInNldEFuZEFwcGx5XCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5pbnRlcmFjdGlvbixuPXQucGhhc2Uscj10LnByZUVuZCxvPXQuc2tpcE1vZGlmaWVycyxpPXRoaXMuc2V0QWxsKHRoaXMuZmlsbEFyZyh7cHJlRW5kOnIscGhhc2U6bixwYWdlQ29vcmRzOnQubW9kaWZpZWRDb29yZHN8fGUuY29vcmRzLmN1ci5wYWdlfSkpO2lmKHRoaXMucmVzdWx0PWksIWkuY2hhbmdlZCYmKCFvfHxvPHRoaXMuc3RhdGVzLmxlbmd0aCkmJmUuaW50ZXJhY3RpbmcoKSlyZXR1cm4hMTtpZih0Lm1vZGlmaWVkQ29vcmRzKXt2YXIgYT1lLmNvb3Jkcy5jdXIucGFnZSxzPXt4OnQubW9kaWZpZWRDb29yZHMueC1hLngseTp0Lm1vZGlmaWVkQ29vcmRzLnktYS55fTtpLmNvb3Jkcy54Kz1zLngsaS5jb29yZHMueSs9cy55LGkuZGVsdGEueCs9cy54LGkuZGVsdGEueSs9cy55fXRoaXMuYXBwbHlUb0ludGVyYWN0aW9uKHQpfX0se2tleTpcImJlZm9yZUVuZFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24sbj10LmV2ZW50LHI9dGhpcy5zdGF0ZXM7aWYociYmci5sZW5ndGgpe2Zvcih2YXIgbz0hMSxpPTA7aTxyLmxlbmd0aDtpKyspe3ZhciBhPXJbaV07dC5zdGF0ZT1hO3ZhciBzPWEub3B0aW9ucyxsPWEubWV0aG9kcyx1PWwuYmVmb3JlRW5kJiZsLmJlZm9yZUVuZCh0KTtpZih1KXJldHVybiB0aGlzLmVuZFJlc3VsdD11LCExO289b3x8IW8mJnRoaXMuc2hvdWxkRG8ocywhMCx0LnBoYXNlLCEwKX1vJiZlLm1vdmUoe2V2ZW50Om4scHJlRW5kOiEwfSl9fX0se2tleTpcInN0b3BcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uO2lmKHRoaXMuc3RhdGVzJiZ0aGlzLnN0YXRlcy5sZW5ndGgpe3ZhciBuPSgwLGouZGVmYXVsdCkoe3N0YXRlczp0aGlzLnN0YXRlcyxpbnRlcmFjdGFibGU6ZS5pbnRlcmFjdGFibGUsZWxlbWVudDplLmVsZW1lbnQscmVjdDpudWxsfSx0KTt0aGlzLmZpbGxBcmcobik7Zm9yKHZhciByPTA7cjx0aGlzLnN0YXRlcy5sZW5ndGg7cisrKXt2YXIgbz10aGlzLnN0YXRlc1tyXTtuLnN0YXRlPW8sby5tZXRob2RzLnN0b3AmJm8ubWV0aG9kcy5zdG9wKG4pfXRoaXMuc3RhdGVzPW51bGwsdGhpcy5lbmRSZXN1bHQ9bnVsbH19fSx7a2V5OlwicHJlcGFyZVN0YXRlc1wiLHZhbHVlOmZ1bmN0aW9uKHQpe3RoaXMuc3RhdGVzPVtdO2Zvcih2YXIgZT0wO2U8dC5sZW5ndGg7ZSsrKXt2YXIgbj10W2VdLHI9bi5vcHRpb25zLG89bi5tZXRob2RzLGk9bi5uYW1lO3RoaXMuc3RhdGVzLnB1c2goe29wdGlvbnM6cixtZXRob2RzOm8saW5kZXg6ZSxuYW1lOml9KX1yZXR1cm4gdGhpcy5zdGF0ZXN9fSx7a2V5OlwicmVzdG9yZUludGVyYWN0aW9uQ29vcmRzXCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbixuPWUuY29vcmRzLHI9ZS5yZWN0LG89ZS5tb2RpZmljYXRpb247aWYoby5yZXN1bHQpe2Zvcih2YXIgaT1vLnN0YXJ0RGVsdGEsYT1vLnJlc3VsdCxzPWEuZGVsdGEsbD1hLnJlY3REZWx0YSx1PVtbbi5zdGFydCxpXSxbbi5jdXIsc11dLGM9MDtjPHUubGVuZ3RoO2MrKyl7dmFyIGY9bWUodVtjXSwyKSxkPWZbMF0scD1mWzFdO2QucGFnZS54LT1wLngsZC5wYWdlLnktPXAueSxkLmNsaWVudC54LT1wLngsZC5jbGllbnQueS09cC55fXIubGVmdC09bC5sZWZ0LHIucmlnaHQtPWwucmlnaHQsci50b3AtPWwudG9wLHIuYm90dG9tLT1sLmJvdHRvbX19fSx7a2V5Olwic2hvdWxkRG9cIix2YWx1ZTpmdW5jdGlvbih0LGUsbixyKXtyZXR1cm4hKCF0fHwhMT09PXQuZW5hYmxlZHx8ciYmIXQuZW5kT25seXx8dC5lbmRPbmx5JiYhZXx8XCJzdGFydFwiPT09biYmIXQuc2V0U3RhcnQpfX0se2tleTpcImNvcHlGcm9tXCIsdmFsdWU6ZnVuY3Rpb24odCl7dGhpcy5zdGFydE9mZnNldD10LnN0YXJ0T2Zmc2V0LHRoaXMuc3RhcnREZWx0YT10LnN0YXJ0RGVsdGEsdGhpcy5lZGdlcz10LmVkZ2VzLHRoaXMuc3RhdGVzPXQuc3RhdGVzLm1hcCgoZnVuY3Rpb24odCl7cmV0dXJuKDAsZ2UuZGVmYXVsdCkodCl9KSksdGhpcy5yZXN1bHQ9UGUoKDAsai5kZWZhdWx0KSh7fSx0LnJlc3VsdC5jb29yZHMpLCgwLGouZGVmYXVsdCkoe30sdC5yZXN1bHQucmVjdCkpfX0se2tleTpcImRlc3Ryb3lcIix2YWx1ZTpmdW5jdGlvbigpe2Zvcih2YXIgdCBpbiB0aGlzKXRoaXNbdF09bnVsbH19XSkmJnhlKGUucHJvdG90eXBlLG4pLHR9KCk7ZnVuY3Rpb24gUGUodCxlKXtyZXR1cm57cmVjdDplLGNvb3Jkczp0LGRlbHRhOnt4OjAseTowfSxyZWN0RGVsdGE6e2xlZnQ6MCxyaWdodDowLHRvcDowLGJvdHRvbTowfSxldmVudFByb3BzOltdLGNoYW5nZWQ6ITB9fWZ1bmN0aW9uIE9lKHQsZSl7cmV0dXJuIHQ/e2xlZnQ6ZS54LXQubGVmdCx0b3A6ZS55LXQudG9wLHJpZ2h0OnQucmlnaHQtZS54LGJvdHRvbTp0LmJvdHRvbS1lLnl9OntsZWZ0OjAsdG9wOjAscmlnaHQ6MCxib3R0b206MH19eWUuZGVmYXVsdD1fZTt2YXIgU2U9e307ZnVuY3Rpb24gRWUodCl7dmFyIGU9dC5pRXZlbnQsbj10LmludGVyYWN0aW9uLm1vZGlmaWNhdGlvbi5yZXN1bHQ7biYmKGUubW9kaWZpZXJzPW4uZXZlbnRQcm9wcyl9T2JqZWN0LmRlZmluZVByb3BlcnR5KFNlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLFNlLm1ha2VNb2RpZmllcj1mdW5jdGlvbih0LGUpe3ZhciBuPXQuZGVmYXVsdHMscj17c3RhcnQ6dC5zdGFydCxzZXQ6dC5zZXQsYmVmb3JlRW5kOnQuYmVmb3JlRW5kLHN0b3A6dC5zdG9wfSxvPWZ1bmN0aW9uKHQpe3ZhciBvPXR8fHt9O2Zvcih2YXIgaSBpbiBvLmVuYWJsZWQ9ITEhPT1vLmVuYWJsZWQsbilpIGluIG98fChvW2ldPW5baV0pO3ZhciBhPXtvcHRpb25zOm8sbWV0aG9kczpyLG5hbWU6ZSxlbmFibGU6ZnVuY3Rpb24oKXtyZXR1cm4gby5lbmFibGVkPSEwLGF9LGRpc2FibGU6ZnVuY3Rpb24oKXtyZXR1cm4gby5lbmFibGVkPSExLGF9fTtyZXR1cm4gYX07cmV0dXJuIGUmJlwic3RyaW5nXCI9PXR5cGVvZiBlJiYoby5fZGVmYXVsdHM9bixvLl9tZXRob2RzPXIpLG99LFNlLmFkZEV2ZW50TW9kaWZpZXJzPUVlLFNlLmRlZmF1bHQ9dm9pZCAwO3ZhciBUZT17aWQ6XCJtb2RpZmllcnMvYmFzZVwiLGJlZm9yZTpbXCJhY3Rpb25zXCJdLGluc3RhbGw6ZnVuY3Rpb24odCl7dC5kZWZhdWx0cy5wZXJBY3Rpb24ubW9kaWZpZXJzPVtdfSxsaXN0ZW5lcnM6e1wiaW50ZXJhY3Rpb25zOm5ld1wiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb247ZS5tb2RpZmljYXRpb249bmV3IHllLmRlZmF1bHQoZSl9LFwiaW50ZXJhY3Rpb25zOmJlZm9yZS1hY3Rpb24tc3RhcnRcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uLm1vZGlmaWNhdGlvbjtlLnN0YXJ0KHQsdC5pbnRlcmFjdGlvbi5jb29yZHMuc3RhcnQucGFnZSksdC5pbnRlcmFjdGlvbi5lZGdlcz1lLmVkZ2VzLGUuYXBwbHlUb0ludGVyYWN0aW9uKHQpfSxcImludGVyYWN0aW9uczpiZWZvcmUtYWN0aW9uLW1vdmVcIjpmdW5jdGlvbih0KXtyZXR1cm4gdC5pbnRlcmFjdGlvbi5tb2RpZmljYXRpb24uc2V0QW5kQXBwbHkodCl9LFwiaW50ZXJhY3Rpb25zOmJlZm9yZS1hY3Rpb24tZW5kXCI6ZnVuY3Rpb24odCl7cmV0dXJuIHQuaW50ZXJhY3Rpb24ubW9kaWZpY2F0aW9uLmJlZm9yZUVuZCh0KX0sXCJpbnRlcmFjdGlvbnM6YWN0aW9uLXN0YXJ0XCI6RWUsXCJpbnRlcmFjdGlvbnM6YWN0aW9uLW1vdmVcIjpFZSxcImludGVyYWN0aW9uczphY3Rpb24tZW5kXCI6RWUsXCJpbnRlcmFjdGlvbnM6YWZ0ZXItYWN0aW9uLXN0YXJ0XCI6ZnVuY3Rpb24odCl7cmV0dXJuIHQuaW50ZXJhY3Rpb24ubW9kaWZpY2F0aW9uLnJlc3RvcmVJbnRlcmFjdGlvbkNvb3Jkcyh0KX0sXCJpbnRlcmFjdGlvbnM6YWZ0ZXItYWN0aW9uLW1vdmVcIjpmdW5jdGlvbih0KXtyZXR1cm4gdC5pbnRlcmFjdGlvbi5tb2RpZmljYXRpb24ucmVzdG9yZUludGVyYWN0aW9uQ29vcmRzKHQpfSxcImludGVyYWN0aW9uczpzdG9wXCI6ZnVuY3Rpb24odCl7cmV0dXJuIHQuaW50ZXJhY3Rpb24ubW9kaWZpY2F0aW9uLnN0b3AodCl9fX07U2UuZGVmYXVsdD1UZTt2YXIgTWU9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KE1lLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLE1lLmRlZmF1bHRzPXZvaWQgMCxNZS5kZWZhdWx0cz17YmFzZTp7cHJldmVudERlZmF1bHQ6XCJhdXRvXCIsZGVsdGFTb3VyY2U6XCJwYWdlXCJ9LHBlckFjdGlvbjp7ZW5hYmxlZDohMSxvcmlnaW46e3g6MCx5OjB9fSxhY3Rpb25zOnt9fTt2YXIgamU9e307ZnVuY3Rpb24ga2UodCl7cmV0dXJuKGtlPVwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmXCJzeW1ib2xcIj09dHlwZW9mIFN5bWJvbC5pdGVyYXRvcj9mdW5jdGlvbih0KXtyZXR1cm4gdHlwZW9mIHR9OmZ1bmN0aW9uKHQpe3JldHVybiB0JiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJnQuY29uc3RydWN0b3I9PT1TeW1ib2wmJnQhPT1TeW1ib2wucHJvdG90eXBlP1wic3ltYm9sXCI6dHlwZW9mIHR9KSh0KX1mdW5jdGlvbiBJZSh0LGUpe2Zvcih2YXIgbj0wO248ZS5sZW5ndGg7bisrKXt2YXIgcj1lW25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkodCxyLmtleSxyKX19ZnVuY3Rpb24gRGUodCxlKXtyZXR1cm4oRGU9T2JqZWN0LnNldFByb3RvdHlwZU9mfHxmdW5jdGlvbih0LGUpe3JldHVybiB0Ll9fcHJvdG9fXz1lLHR9KSh0LGUpfWZ1bmN0aW9uIEFlKHQsZSl7cmV0dXJuIWV8fFwib2JqZWN0XCIhPT1rZShlKSYmXCJmdW5jdGlvblwiIT10eXBlb2YgZT9SZSh0KTplfWZ1bmN0aW9uIFJlKHQpe2lmKHZvaWQgMD09PXQpdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO3JldHVybiB0fWZ1bmN0aW9uIHplKHQpe3JldHVybih6ZT1PYmplY3Quc2V0UHJvdG90eXBlT2Y/T2JqZWN0LmdldFByb3RvdHlwZU9mOmZ1bmN0aW9uKHQpe3JldHVybiB0Ll9fcHJvdG9fX3x8T2JqZWN0LmdldFByb3RvdHlwZU9mKHQpfSkodCl9ZnVuY3Rpb24gQ2UodCxlLG4pe3JldHVybiBlIGluIHQ/T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsZSx7dmFsdWU6bixlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMH0pOnRbZV09bix0fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShqZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxqZS5JbnRlcmFjdEV2ZW50PXZvaWQgMDt2YXIgRmU9ZnVuY3Rpb24odCl7IWZ1bmN0aW9uKHQsZSl7aWYoXCJmdW5jdGlvblwiIT10eXBlb2YgZSYmbnVsbCE9PWUpdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uXCIpO3QucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoZSYmZS5wcm90b3R5cGUse2NvbnN0cnVjdG9yOnt2YWx1ZTp0LHdyaXRhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMH19KSxlJiZEZSh0LGUpfShhLHQpO3ZhciBlLG4scixvLGk9KHI9YSxvPWZ1bmN0aW9uKCl7aWYoXCJ1bmRlZmluZWRcIj09dHlwZW9mIFJlZmxlY3R8fCFSZWZsZWN0LmNvbnN0cnVjdClyZXR1cm4hMTtpZihSZWZsZWN0LmNvbnN0cnVjdC5zaGFtKXJldHVybiExO2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIFByb3h5KXJldHVybiEwO3RyeXtyZXR1cm4gQm9vbGVhbi5wcm90b3R5cGUudmFsdWVPZi5jYWxsKFJlZmxlY3QuY29uc3RydWN0KEJvb2xlYW4sW10sKGZ1bmN0aW9uKCl7fSkpKSwhMH1jYXRjaCh0KXtyZXR1cm4hMX19KCksZnVuY3Rpb24oKXt2YXIgdCxlPXplKHIpO2lmKG8pe3ZhciBuPXplKHRoaXMpLmNvbnN0cnVjdG9yO3Q9UmVmbGVjdC5jb25zdHJ1Y3QoZSxhcmd1bWVudHMsbil9ZWxzZSB0PWUuYXBwbHkodGhpcyxhcmd1bWVudHMpO3JldHVybiBBZSh0aGlzLHQpfSk7ZnVuY3Rpb24gYSh0LGUsbixyLG8scyxsKXt2YXIgdTshZnVuY3Rpb24odCxlKXtpZighKHQgaW5zdGFuY2VvZiBlKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfSh0aGlzLGEpLENlKFJlKHU9aS5jYWxsKHRoaXMsdCkpLFwidGFyZ2V0XCIsdm9pZCAwKSxDZShSZSh1KSxcImN1cnJlbnRUYXJnZXRcIix2b2lkIDApLENlKFJlKHUpLFwicmVsYXRlZFRhcmdldFwiLG51bGwpLENlKFJlKHUpLFwic2NyZWVuWFwiLHZvaWQgMCksQ2UoUmUodSksXCJzY3JlZW5ZXCIsdm9pZCAwKSxDZShSZSh1KSxcImJ1dHRvblwiLHZvaWQgMCksQ2UoUmUodSksXCJidXR0b25zXCIsdm9pZCAwKSxDZShSZSh1KSxcImN0cmxLZXlcIix2b2lkIDApLENlKFJlKHUpLFwic2hpZnRLZXlcIix2b2lkIDApLENlKFJlKHUpLFwiYWx0S2V5XCIsdm9pZCAwKSxDZShSZSh1KSxcIm1ldGFLZXlcIix2b2lkIDApLENlKFJlKHUpLFwicGFnZVwiLHZvaWQgMCksQ2UoUmUodSksXCJjbGllbnRcIix2b2lkIDApLENlKFJlKHUpLFwiZGVsdGFcIix2b2lkIDApLENlKFJlKHUpLFwicmVjdFwiLHZvaWQgMCksQ2UoUmUodSksXCJ4MFwiLHZvaWQgMCksQ2UoUmUodSksXCJ5MFwiLHZvaWQgMCksQ2UoUmUodSksXCJ0MFwiLHZvaWQgMCksQ2UoUmUodSksXCJkdFwiLHZvaWQgMCksQ2UoUmUodSksXCJkdXJhdGlvblwiLHZvaWQgMCksQ2UoUmUodSksXCJjbGllbnRYMFwiLHZvaWQgMCksQ2UoUmUodSksXCJjbGllbnRZMFwiLHZvaWQgMCksQ2UoUmUodSksXCJ2ZWxvY2l0eVwiLHZvaWQgMCksQ2UoUmUodSksXCJzcGVlZFwiLHZvaWQgMCksQ2UoUmUodSksXCJzd2lwZVwiLHZvaWQgMCksQ2UoUmUodSksXCJ0aW1lU3RhbXBcIix2b2lkIDApLENlKFJlKHUpLFwiYXhlc1wiLHZvaWQgMCksQ2UoUmUodSksXCJwcmVFbmRcIix2b2lkIDApLG89b3x8dC5lbGVtZW50O3ZhciBjPXQuaW50ZXJhY3RhYmxlLGY9KGMmJmMub3B0aW9uc3x8TWUuZGVmYXVsdHMpLmRlbHRhU291cmNlLGQ9KDAsQS5kZWZhdWx0KShjLG8sbikscD1cInN0YXJ0XCI9PT1yLHY9XCJlbmRcIj09PXIsaD1wP1JlKHUpOnQucHJldkV2ZW50LGc9cD90LmNvb3Jkcy5zdGFydDp2P3twYWdlOmgucGFnZSxjbGllbnQ6aC5jbGllbnQsdGltZVN0YW1wOnQuY29vcmRzLmN1ci50aW1lU3RhbXB9OnQuY29vcmRzLmN1cjtyZXR1cm4gdS5wYWdlPSgwLGouZGVmYXVsdCkoe30sZy5wYWdlKSx1LmNsaWVudD0oMCxqLmRlZmF1bHQpKHt9LGcuY2xpZW50KSx1LnJlY3Q9KDAsai5kZWZhdWx0KSh7fSx0LnJlY3QpLHUudGltZVN0YW1wPWcudGltZVN0YW1wLHZ8fCh1LnBhZ2UueC09ZC54LHUucGFnZS55LT1kLnksdS5jbGllbnQueC09ZC54LHUuY2xpZW50LnktPWQueSksdS5jdHJsS2V5PWUuY3RybEtleSx1LmFsdEtleT1lLmFsdEtleSx1LnNoaWZ0S2V5PWUuc2hpZnRLZXksdS5tZXRhS2V5PWUubWV0YUtleSx1LmJ1dHRvbj1lLmJ1dHRvbix1LmJ1dHRvbnM9ZS5idXR0b25zLHUudGFyZ2V0PW8sdS5jdXJyZW50VGFyZ2V0PW8sdS5wcmVFbmQ9cyx1LnR5cGU9bHx8bisocnx8XCJcIiksdS5pbnRlcmFjdGFibGU9Yyx1LnQwPXA/dC5wb2ludGVyc1t0LnBvaW50ZXJzLmxlbmd0aC0xXS5kb3duVGltZTpoLnQwLHUueDA9dC5jb29yZHMuc3RhcnQucGFnZS54LWQueCx1LnkwPXQuY29vcmRzLnN0YXJ0LnBhZ2UueS1kLnksdS5jbGllbnRYMD10LmNvb3Jkcy5zdGFydC5jbGllbnQueC1kLngsdS5jbGllbnRZMD10LmNvb3Jkcy5zdGFydC5jbGllbnQueS1kLnksdS5kZWx0YT1wfHx2P3t4OjAseTowfTp7eDp1W2ZdLngtaFtmXS54LHk6dVtmXS55LWhbZl0ueX0sdS5kdD10LmNvb3Jkcy5kZWx0YS50aW1lU3RhbXAsdS5kdXJhdGlvbj11LnRpbWVTdGFtcC11LnQwLHUudmVsb2NpdHk9KDAsai5kZWZhdWx0KSh7fSx0LmNvb3Jkcy52ZWxvY2l0eVtmXSksdS5zcGVlZD0oMCxDLmRlZmF1bHQpKHUudmVsb2NpdHkueCx1LnZlbG9jaXR5LnkpLHUuc3dpcGU9dnx8XCJpbmVydGlhc3RhcnRcIj09PXI/dS5nZXRTd2lwZSgpOm51bGwsdX1yZXR1cm4gZT1hLChuPVt7a2V5OlwiZ2V0U3dpcGVcIix2YWx1ZTpmdW5jdGlvbigpe3ZhciB0PXRoaXMuX2ludGVyYWN0aW9uO2lmKHQucHJldkV2ZW50LnNwZWVkPDYwMHx8dGhpcy50aW1lU3RhbXAtdC5wcmV2RXZlbnQudGltZVN0YW1wPjE1MClyZXR1cm4gbnVsbDt2YXIgZT0xODAqTWF0aC5hdGFuMih0LnByZXZFdmVudC52ZWxvY2l0eVksdC5wcmV2RXZlbnQudmVsb2NpdHlYKS9NYXRoLlBJO2U8MCYmKGUrPTM2MCk7dmFyIG49MTEyLjU8PWUmJmU8MjQ3LjUscj0yMDIuNTw9ZSYmZTwzMzcuNTtyZXR1cm57dXA6cixkb3duOiFyJiYyMi41PD1lJiZlPDE1Ny41LGxlZnQ6bixyaWdodDohbiYmKDI5Mi41PD1lfHxlPDY3LjUpLGFuZ2xlOmUsc3BlZWQ6dC5wcmV2RXZlbnQuc3BlZWQsdmVsb2NpdHk6e3g6dC5wcmV2RXZlbnQudmVsb2NpdHlYLHk6dC5wcmV2RXZlbnQudmVsb2NpdHlZfX19fSx7a2V5OlwicHJldmVudERlZmF1bHRcIix2YWx1ZTpmdW5jdGlvbigpe319LHtrZXk6XCJzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb25cIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuaW1tZWRpYXRlUHJvcGFnYXRpb25TdG9wcGVkPXRoaXMucHJvcGFnYXRpb25TdG9wcGVkPSEwfX0se2tleTpcInN0b3BQcm9wYWdhdGlvblwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5wcm9wYWdhdGlvblN0b3BwZWQ9ITB9fV0pJiZJZShlLnByb3RvdHlwZSxuKSxhfSgkLkJhc2VFdmVudCk7amUuSW50ZXJhY3RFdmVudD1GZSxPYmplY3QuZGVmaW5lUHJvcGVydGllcyhGZS5wcm90b3R5cGUse3BhZ2VYOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5wYWdlLnh9LHNldDpmdW5jdGlvbih0KXt0aGlzLnBhZ2UueD10fX0scGFnZVk6e2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnBhZ2UueX0sc2V0OmZ1bmN0aW9uKHQpe3RoaXMucGFnZS55PXR9fSxjbGllbnRYOntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5jbGllbnQueH0sc2V0OmZ1bmN0aW9uKHQpe3RoaXMuY2xpZW50Lng9dH19LGNsaWVudFk6e2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmNsaWVudC55fSxzZXQ6ZnVuY3Rpb24odCl7dGhpcy5jbGllbnQueT10fX0sZHg6e2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmRlbHRhLnh9LHNldDpmdW5jdGlvbih0KXt0aGlzLmRlbHRhLng9dH19LGR5OntnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5kZWx0YS55fSxzZXQ6ZnVuY3Rpb24odCl7dGhpcy5kZWx0YS55PXR9fSx2ZWxvY2l0eVg6e2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnZlbG9jaXR5Lnh9LHNldDpmdW5jdGlvbih0KXt0aGlzLnZlbG9jaXR5Lng9dH19LHZlbG9jaXR5WTp7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudmVsb2NpdHkueX0sc2V0OmZ1bmN0aW9uKHQpe3RoaXMudmVsb2NpdHkueT10fX19KTt2YXIgWGU9e307ZnVuY3Rpb24gWWUodCxlLG4pe3JldHVybiBlIGluIHQ/T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsZSx7dmFsdWU6bixlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMH0pOnRbZV09bix0fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShYZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxYZS5Qb2ludGVySW5mbz12b2lkIDAsWGUuUG9pbnRlckluZm89ZnVuY3Rpb24gdChlLG4scixvLGkpeyFmdW5jdGlvbih0LGUpe2lmKCEodCBpbnN0YW5jZW9mIGUpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9KHRoaXMsdCksWWUodGhpcyxcImlkXCIsdm9pZCAwKSxZZSh0aGlzLFwicG9pbnRlclwiLHZvaWQgMCksWWUodGhpcyxcImV2ZW50XCIsdm9pZCAwKSxZZSh0aGlzLFwiZG93blRpbWVcIix2b2lkIDApLFllKHRoaXMsXCJkb3duVGFyZ2V0XCIsdm9pZCAwKSx0aGlzLmlkPWUsdGhpcy5wb2ludGVyPW4sdGhpcy5ldmVudD1yLHRoaXMuZG93blRpbWU9byx0aGlzLmRvd25UYXJnZXQ9aX07dmFyIEJlLFdlLExlPXt9O2Z1bmN0aW9uIFVlKHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHIua2V5LHIpfX1mdW5jdGlvbiBWZSh0LGUsbil7cmV0dXJuIGUgaW4gdD9PYmplY3QuZGVmaW5lUHJvcGVydHkodCxlLHt2YWx1ZTpuLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwfSk6dFtlXT1uLHR9T2JqZWN0LmRlZmluZVByb3BlcnR5KExlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShMZSxcIlBvaW50ZXJJbmZvXCIse2VudW1lcmFibGU6ITAsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIFhlLlBvaW50ZXJJbmZvfX0pLExlLmRlZmF1bHQ9TGUuSW50ZXJhY3Rpb249TGUuX1Byb3h5TWV0aG9kcz1MZS5fUHJveHlWYWx1ZXM9dm9pZCAwLExlLl9Qcm94eVZhbHVlcz1CZSxmdW5jdGlvbih0KXt0LmludGVyYWN0YWJsZT1cIlwiLHQuZWxlbWVudD1cIlwiLHQucHJlcGFyZWQ9XCJcIix0LnBvaW50ZXJJc0Rvd249XCJcIix0LnBvaW50ZXJXYXNNb3ZlZD1cIlwiLHQuX3Byb3h5PVwiXCJ9KEJlfHwoTGUuX1Byb3h5VmFsdWVzPUJlPXt9KSksTGUuX1Byb3h5TWV0aG9kcz1XZSxmdW5jdGlvbih0KXt0LnN0YXJ0PVwiXCIsdC5tb3ZlPVwiXCIsdC5lbmQ9XCJcIix0LnN0b3A9XCJcIix0LmludGVyYWN0aW5nPVwiXCJ9KFdlfHwoTGUuX1Byb3h5TWV0aG9kcz1XZT17fSkpO3ZhciBOZT0wLHFlPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdChlKXt2YXIgbj10aGlzLHI9ZS5wb2ludGVyVHlwZSxvPWUuc2NvcGVGaXJlOyFmdW5jdGlvbih0LGUpe2lmKCEodCBpbnN0YW5jZW9mIGUpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9KHRoaXMsdCksVmUodGhpcyxcImludGVyYWN0YWJsZVwiLG51bGwpLFZlKHRoaXMsXCJlbGVtZW50XCIsbnVsbCksVmUodGhpcyxcInJlY3RcIix2b2lkIDApLFZlKHRoaXMsXCJfcmVjdHNcIix2b2lkIDApLFZlKHRoaXMsXCJlZGdlc1wiLHZvaWQgMCksVmUodGhpcyxcIl9zY29wZUZpcmVcIix2b2lkIDApLFZlKHRoaXMsXCJwcmVwYXJlZFwiLHtuYW1lOm51bGwsYXhpczpudWxsLGVkZ2VzOm51bGx9KSxWZSh0aGlzLFwicG9pbnRlclR5cGVcIix2b2lkIDApLFZlKHRoaXMsXCJwb2ludGVyc1wiLFtdKSxWZSh0aGlzLFwiZG93bkV2ZW50XCIsbnVsbCksVmUodGhpcyxcImRvd25Qb2ludGVyXCIse30pLFZlKHRoaXMsXCJfbGF0ZXN0UG9pbnRlclwiLHtwb2ludGVyOm51bGwsZXZlbnQ6bnVsbCxldmVudFRhcmdldDpudWxsfSksVmUodGhpcyxcInByZXZFdmVudFwiLG51bGwpLFZlKHRoaXMsXCJwb2ludGVySXNEb3duXCIsITEpLFZlKHRoaXMsXCJwb2ludGVyV2FzTW92ZWRcIiwhMSksVmUodGhpcyxcIl9pbnRlcmFjdGluZ1wiLCExKSxWZSh0aGlzLFwiX2VuZGluZ1wiLCExKSxWZSh0aGlzLFwiX3N0b3BwZWRcIiwhMCksVmUodGhpcyxcIl9wcm94eVwiLG51bGwpLFZlKHRoaXMsXCJzaW11bGF0aW9uXCIsbnVsbCksVmUodGhpcyxcImRvTW92ZVwiLCgwLFl0Lndhcm5PbmNlKSgoZnVuY3Rpb24odCl7dGhpcy5tb3ZlKHQpfSksXCJUaGUgaW50ZXJhY3Rpb24uZG9Nb3ZlKCkgbWV0aG9kIGhhcyBiZWVuIHJlbmFtZWQgdG8gaW50ZXJhY3Rpb24ubW92ZSgpXCIpKSxWZSh0aGlzLFwiY29vcmRzXCIse3N0YXJ0OkIubmV3Q29vcmRzKCkscHJldjpCLm5ld0Nvb3JkcygpLGN1cjpCLm5ld0Nvb3JkcygpLGRlbHRhOkIubmV3Q29vcmRzKCksdmVsb2NpdHk6Qi5uZXdDb29yZHMoKX0pLFZlKHRoaXMsXCJfaWRcIixOZSsrKSx0aGlzLl9zY29wZUZpcmU9byx0aGlzLnBvaW50ZXJUeXBlPXI7dmFyIGk9dGhpczt0aGlzLl9wcm94eT17fTt2YXIgYT1mdW5jdGlvbih0KXtPYmplY3QuZGVmaW5lUHJvcGVydHkobi5fcHJveHksdCx7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIGlbdF19fSl9O2Zvcih2YXIgcyBpbiBCZSlhKHMpO3ZhciBsPWZ1bmN0aW9uKHQpe09iamVjdC5kZWZpbmVQcm9wZXJ0eShuLl9wcm94eSx0LHt2YWx1ZTpmdW5jdGlvbigpe3JldHVybiBpW3RdLmFwcGx5KGksYXJndW1lbnRzKX19KX07Zm9yKHZhciB1IGluIFdlKWwodSk7dGhpcy5fc2NvcGVGaXJlKFwiaW50ZXJhY3Rpb25zOm5ld1wiLHtpbnRlcmFjdGlvbjp0aGlzfSl9dmFyIGUsbjtyZXR1cm4gZT10LChuPVt7a2V5OlwicG9pbnRlck1vdmVUb2xlcmFuY2VcIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gMX19LHtrZXk6XCJwb2ludGVyRG93blwiLHZhbHVlOmZ1bmN0aW9uKHQsZSxuKXt2YXIgcj10aGlzLnVwZGF0ZVBvaW50ZXIodCxlLG4sITApLG89dGhpcy5wb2ludGVyc1tyXTt0aGlzLl9zY29wZUZpcmUoXCJpbnRlcmFjdGlvbnM6ZG93blwiLHtwb2ludGVyOnQsZXZlbnQ6ZSxldmVudFRhcmdldDpuLHBvaW50ZXJJbmRleDpyLHBvaW50ZXJJbmZvOm8sdHlwZTpcImRvd25cIixpbnRlcmFjdGlvbjp0aGlzfSl9fSx7a2V5Olwic3RhcnRcIix2YWx1ZTpmdW5jdGlvbih0LGUsbil7cmV0dXJuISh0aGlzLmludGVyYWN0aW5nKCl8fCF0aGlzLnBvaW50ZXJJc0Rvd258fHRoaXMucG9pbnRlcnMubGVuZ3RoPChcImdlc3R1cmVcIj09PXQubmFtZT8yOjEpfHwhZS5vcHRpb25zW3QubmFtZV0uZW5hYmxlZCkmJigoMCxZdC5jb3B5QWN0aW9uKSh0aGlzLnByZXBhcmVkLHQpLHRoaXMuaW50ZXJhY3RhYmxlPWUsdGhpcy5lbGVtZW50PW4sdGhpcy5yZWN0PWUuZ2V0UmVjdChuKSx0aGlzLmVkZ2VzPXRoaXMucHJlcGFyZWQuZWRnZXM/KDAsai5kZWZhdWx0KSh7fSx0aGlzLnByZXBhcmVkLmVkZ2VzKTp7bGVmdDohMCxyaWdodDohMCx0b3A6ITAsYm90dG9tOiEwfSx0aGlzLl9zdG9wcGVkPSExLHRoaXMuX2ludGVyYWN0aW5nPXRoaXMuX2RvUGhhc2Uoe2ludGVyYWN0aW9uOnRoaXMsZXZlbnQ6dGhpcy5kb3duRXZlbnQscGhhc2U6XCJzdGFydFwifSkmJiF0aGlzLl9zdG9wcGVkLHRoaXMuX2ludGVyYWN0aW5nKX19LHtrZXk6XCJwb2ludGVyTW92ZVwiLHZhbHVlOmZ1bmN0aW9uKHQsZSxuKXt0aGlzLnNpbXVsYXRpb258fHRoaXMubW9kaWZpY2F0aW9uJiZ0aGlzLm1vZGlmaWNhdGlvbi5lbmRSZXN1bHR8fHRoaXMudXBkYXRlUG9pbnRlcih0LGUsbiwhMSk7dmFyIHIsbyxpPXRoaXMuY29vcmRzLmN1ci5wYWdlLng9PT10aGlzLmNvb3Jkcy5wcmV2LnBhZ2UueCYmdGhpcy5jb29yZHMuY3VyLnBhZ2UueT09PXRoaXMuY29vcmRzLnByZXYucGFnZS55JiZ0aGlzLmNvb3Jkcy5jdXIuY2xpZW50Lng9PT10aGlzLmNvb3Jkcy5wcmV2LmNsaWVudC54JiZ0aGlzLmNvb3Jkcy5jdXIuY2xpZW50Lnk9PT10aGlzLmNvb3Jkcy5wcmV2LmNsaWVudC55O3RoaXMucG9pbnRlcklzRG93biYmIXRoaXMucG9pbnRlcldhc01vdmVkJiYocj10aGlzLmNvb3Jkcy5jdXIuY2xpZW50LngtdGhpcy5jb29yZHMuc3RhcnQuY2xpZW50Lngsbz10aGlzLmNvb3Jkcy5jdXIuY2xpZW50LnktdGhpcy5jb29yZHMuc3RhcnQuY2xpZW50LnksdGhpcy5wb2ludGVyV2FzTW92ZWQ9KDAsQy5kZWZhdWx0KShyLG8pPnRoaXMucG9pbnRlck1vdmVUb2xlcmFuY2UpO3ZhciBhPXRoaXMuZ2V0UG9pbnRlckluZGV4KHQpLHM9e3BvaW50ZXI6dCxwb2ludGVySW5kZXg6YSxwb2ludGVySW5mbzp0aGlzLnBvaW50ZXJzW2FdLGV2ZW50OmUsdHlwZTpcIm1vdmVcIixldmVudFRhcmdldDpuLGR4OnIsZHk6byxkdXBsaWNhdGU6aSxpbnRlcmFjdGlvbjp0aGlzfTtpfHxCLnNldENvb3JkVmVsb2NpdHkodGhpcy5jb29yZHMudmVsb2NpdHksdGhpcy5jb29yZHMuZGVsdGEpLHRoaXMuX3Njb3BlRmlyZShcImludGVyYWN0aW9uczptb3ZlXCIscyksaXx8dGhpcy5zaW11bGF0aW9ufHwodGhpcy5pbnRlcmFjdGluZygpJiYocy50eXBlPW51bGwsdGhpcy5tb3ZlKHMpKSx0aGlzLnBvaW50ZXJXYXNNb3ZlZCYmQi5jb3B5Q29vcmRzKHRoaXMuY29vcmRzLnByZXYsdGhpcy5jb29yZHMuY3VyKSl9fSx7a2V5OlwibW92ZVwiLHZhbHVlOmZ1bmN0aW9uKHQpe3QmJnQuZXZlbnR8fEIuc2V0WmVyb0Nvb3Jkcyh0aGlzLmNvb3Jkcy5kZWx0YSksKHQ9KDAsai5kZWZhdWx0KSh7cG9pbnRlcjp0aGlzLl9sYXRlc3RQb2ludGVyLnBvaW50ZXIsZXZlbnQ6dGhpcy5fbGF0ZXN0UG9pbnRlci5ldmVudCxldmVudFRhcmdldDp0aGlzLl9sYXRlc3RQb2ludGVyLmV2ZW50VGFyZ2V0LGludGVyYWN0aW9uOnRoaXN9LHR8fHt9KSkucGhhc2U9XCJtb3ZlXCIsdGhpcy5fZG9QaGFzZSh0KX19LHtrZXk6XCJwb2ludGVyVXBcIix2YWx1ZTpmdW5jdGlvbih0LGUsbixyKXt2YXIgbz10aGlzLmdldFBvaW50ZXJJbmRleCh0KTstMT09PW8mJihvPXRoaXMudXBkYXRlUG9pbnRlcih0LGUsbiwhMSkpO3ZhciBpPS9jYW5jZWwkL2kudGVzdChlLnR5cGUpP1wiY2FuY2VsXCI6XCJ1cFwiO3RoaXMuX3Njb3BlRmlyZShcImludGVyYWN0aW9uczpcIi5jb25jYXQoaSkse3BvaW50ZXI6dCxwb2ludGVySW5kZXg6byxwb2ludGVySW5mbzp0aGlzLnBvaW50ZXJzW29dLGV2ZW50OmUsZXZlbnRUYXJnZXQ6bix0eXBlOmksY3VyRXZlbnRUYXJnZXQ6cixpbnRlcmFjdGlvbjp0aGlzfSksdGhpcy5zaW11bGF0aW9ufHx0aGlzLmVuZChlKSx0aGlzLnJlbW92ZVBvaW50ZXIodCxlKX19LHtrZXk6XCJkb2N1bWVudEJsdXJcIix2YWx1ZTpmdW5jdGlvbih0KXt0aGlzLmVuZCh0KSx0aGlzLl9zY29wZUZpcmUoXCJpbnRlcmFjdGlvbnM6Ymx1clwiLHtldmVudDp0LHR5cGU6XCJibHVyXCIsaW50ZXJhY3Rpb246dGhpc30pfX0se2tleTpcImVuZFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlO3RoaXMuX2VuZGluZz0hMCx0PXR8fHRoaXMuX2xhdGVzdFBvaW50ZXIuZXZlbnQsdGhpcy5pbnRlcmFjdGluZygpJiYoZT10aGlzLl9kb1BoYXNlKHtldmVudDp0LGludGVyYWN0aW9uOnRoaXMscGhhc2U6XCJlbmRcIn0pKSx0aGlzLl9lbmRpbmc9ITEsITA9PT1lJiZ0aGlzLnN0b3AoKX19LHtrZXk6XCJjdXJyZW50QWN0aW9uXCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5faW50ZXJhY3Rpbmc/dGhpcy5wcmVwYXJlZC5uYW1lOm51bGx9fSx7a2V5OlwiaW50ZXJhY3RpbmdcIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9pbnRlcmFjdGluZ319LHtrZXk6XCJzdG9wXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLl9zY29wZUZpcmUoXCJpbnRlcmFjdGlvbnM6c3RvcFwiLHtpbnRlcmFjdGlvbjp0aGlzfSksdGhpcy5pbnRlcmFjdGFibGU9dGhpcy5lbGVtZW50PW51bGwsdGhpcy5faW50ZXJhY3Rpbmc9ITEsdGhpcy5fc3RvcHBlZD0hMCx0aGlzLnByZXBhcmVkLm5hbWU9dGhpcy5wcmV2RXZlbnQ9bnVsbH19LHtrZXk6XCJnZXRQb2ludGVySW5kZXhcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT1CLmdldFBvaW50ZXJJZCh0KTtyZXR1cm5cIm1vdXNlXCI9PT10aGlzLnBvaW50ZXJUeXBlfHxcInBlblwiPT09dGhpcy5wb2ludGVyVHlwZT90aGlzLnBvaW50ZXJzLmxlbmd0aC0xOlouZmluZEluZGV4KHRoaXMucG9pbnRlcnMsKGZ1bmN0aW9uKHQpe3JldHVybiB0LmlkPT09ZX0pKX19LHtrZXk6XCJnZXRQb2ludGVySW5mb1wiLHZhbHVlOmZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLnBvaW50ZXJzW3RoaXMuZ2V0UG9pbnRlckluZGV4KHQpXX19LHtrZXk6XCJ1cGRhdGVQb2ludGVyXCIsdmFsdWU6ZnVuY3Rpb24odCxlLG4scil7dmFyIG89Qi5nZXRQb2ludGVySWQodCksaT10aGlzLmdldFBvaW50ZXJJbmRleCh0KSxhPXRoaXMucG9pbnRlcnNbaV07cmV0dXJuIHI9ITEhPT1yJiYocnx8Lyhkb3dufHN0YXJ0KSQvaS50ZXN0KGUudHlwZSkpLGE/YS5wb2ludGVyPXQ6KGE9bmV3IFhlLlBvaW50ZXJJbmZvKG8sdCxlLG51bGwsbnVsbCksaT10aGlzLnBvaW50ZXJzLmxlbmd0aCx0aGlzLnBvaW50ZXJzLnB1c2goYSkpLEIuc2V0Q29vcmRzKHRoaXMuY29vcmRzLmN1cix0aGlzLnBvaW50ZXJzLm1hcCgoZnVuY3Rpb24odCl7cmV0dXJuIHQucG9pbnRlcn0pKSx0aGlzLl9ub3coKSksQi5zZXRDb29yZERlbHRhcyh0aGlzLmNvb3Jkcy5kZWx0YSx0aGlzLmNvb3Jkcy5wcmV2LHRoaXMuY29vcmRzLmN1ciksciYmKHRoaXMucG9pbnRlcklzRG93bj0hMCxhLmRvd25UaW1lPXRoaXMuY29vcmRzLmN1ci50aW1lU3RhbXAsYS5kb3duVGFyZ2V0PW4sQi5wb2ludGVyRXh0ZW5kKHRoaXMuZG93blBvaW50ZXIsdCksdGhpcy5pbnRlcmFjdGluZygpfHwoQi5jb3B5Q29vcmRzKHRoaXMuY29vcmRzLnN0YXJ0LHRoaXMuY29vcmRzLmN1ciksQi5jb3B5Q29vcmRzKHRoaXMuY29vcmRzLnByZXYsdGhpcy5jb29yZHMuY3VyKSx0aGlzLmRvd25FdmVudD1lLHRoaXMucG9pbnRlcldhc01vdmVkPSExKSksdGhpcy5fdXBkYXRlTGF0ZXN0UG9pbnRlcih0LGUsbiksdGhpcy5fc2NvcGVGaXJlKFwiaW50ZXJhY3Rpb25zOnVwZGF0ZS1wb2ludGVyXCIse3BvaW50ZXI6dCxldmVudDplLGV2ZW50VGFyZ2V0Om4sZG93bjpyLHBvaW50ZXJJbmZvOmEscG9pbnRlckluZGV4OmksaW50ZXJhY3Rpb246dGhpc30pLGl9fSx7a2V5OlwicmVtb3ZlUG9pbnRlclwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7dmFyIG49dGhpcy5nZXRQb2ludGVySW5kZXgodCk7aWYoLTEhPT1uKXt2YXIgcj10aGlzLnBvaW50ZXJzW25dO3RoaXMuX3Njb3BlRmlyZShcImludGVyYWN0aW9uczpyZW1vdmUtcG9pbnRlclwiLHtwb2ludGVyOnQsZXZlbnQ6ZSxldmVudFRhcmdldDpudWxsLHBvaW50ZXJJbmRleDpuLHBvaW50ZXJJbmZvOnIsaW50ZXJhY3Rpb246dGhpc30pLHRoaXMucG9pbnRlcnMuc3BsaWNlKG4sMSksdGhpcy5wb2ludGVySXNEb3duPSExfX19LHtrZXk6XCJfdXBkYXRlTGF0ZXN0UG9pbnRlclwiLHZhbHVlOmZ1bmN0aW9uKHQsZSxuKXt0aGlzLl9sYXRlc3RQb2ludGVyLnBvaW50ZXI9dCx0aGlzLl9sYXRlc3RQb2ludGVyLmV2ZW50PWUsdGhpcy5fbGF0ZXN0UG9pbnRlci5ldmVudFRhcmdldD1ufX0se2tleTpcImRlc3Ryb3lcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuX2xhdGVzdFBvaW50ZXIucG9pbnRlcj1udWxsLHRoaXMuX2xhdGVzdFBvaW50ZXIuZXZlbnQ9bnVsbCx0aGlzLl9sYXRlc3RQb2ludGVyLmV2ZW50VGFyZ2V0PW51bGx9fSx7a2V5OlwiX2NyZWF0ZVByZXBhcmVkRXZlbnRcIix2YWx1ZTpmdW5jdGlvbih0LGUsbixyKXtyZXR1cm4gbmV3IGplLkludGVyYWN0RXZlbnQodGhpcyx0LHRoaXMucHJlcGFyZWQubmFtZSxlLHRoaXMuZWxlbWVudCxuLHIpfX0se2tleTpcIl9maXJlRXZlbnRcIix2YWx1ZTpmdW5jdGlvbih0KXt0aGlzLmludGVyYWN0YWJsZS5maXJlKHQpLCghdGhpcy5wcmV2RXZlbnR8fHQudGltZVN0YW1wPj10aGlzLnByZXZFdmVudC50aW1lU3RhbXApJiYodGhpcy5wcmV2RXZlbnQ9dCl9fSx7a2V5OlwiX2RvUGhhc2VcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10LmV2ZW50LG49dC5waGFzZSxyPXQucHJlRW5kLG89dC50eXBlLGk9dGhpcy5yZWN0O2lmKGkmJlwibW92ZVwiPT09biYmKGsuYWRkRWRnZXModGhpcy5lZGdlcyxpLHRoaXMuY29vcmRzLmRlbHRhW3RoaXMuaW50ZXJhY3RhYmxlLm9wdGlvbnMuZGVsdGFTb3VyY2VdKSxpLndpZHRoPWkucmlnaHQtaS5sZWZ0LGkuaGVpZ2h0PWkuYm90dG9tLWkudG9wKSwhMT09PXRoaXMuX3Njb3BlRmlyZShcImludGVyYWN0aW9uczpiZWZvcmUtYWN0aW9uLVwiLmNvbmNhdChuKSx0KSlyZXR1cm4hMTt2YXIgYT10LmlFdmVudD10aGlzLl9jcmVhdGVQcmVwYXJlZEV2ZW50KGUsbixyLG8pO3JldHVybiB0aGlzLl9zY29wZUZpcmUoXCJpbnRlcmFjdGlvbnM6YWN0aW9uLVwiLmNvbmNhdChuKSx0KSxcInN0YXJ0XCI9PT1uJiYodGhpcy5wcmV2RXZlbnQ9YSksdGhpcy5fZmlyZUV2ZW50KGEpLHRoaXMuX3Njb3BlRmlyZShcImludGVyYWN0aW9uczphZnRlci1hY3Rpb24tXCIuY29uY2F0KG4pLHQpLCEwfX0se2tleTpcIl9ub3dcIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiBEYXRlLm5vdygpfX1dKSYmVWUoZS5wcm90b3R5cGUsbiksdH0oKTtMZS5JbnRlcmFjdGlvbj1xZTt2YXIgJGU9cWU7TGUuZGVmYXVsdD0kZTt2YXIgR2U9e307ZnVuY3Rpb24gSGUodCl7dC5wb2ludGVySXNEb3duJiYoUWUodC5jb29yZHMuY3VyLHQub2Zmc2V0LnRvdGFsKSx0Lm9mZnNldC5wZW5kaW5nLng9MCx0Lm9mZnNldC5wZW5kaW5nLnk9MCl9ZnVuY3Rpb24gS2UodCl7WmUodC5pbnRlcmFjdGlvbil9ZnVuY3Rpb24gWmUodCl7aWYoIWZ1bmN0aW9uKHQpe3JldHVybiEoIXQub2Zmc2V0LnBlbmRpbmcueCYmIXQub2Zmc2V0LnBlbmRpbmcueSl9KHQpKXJldHVybiExO3ZhciBlPXQub2Zmc2V0LnBlbmRpbmc7cmV0dXJuIFFlKHQuY29vcmRzLmN1cixlKSxRZSh0LmNvb3Jkcy5kZWx0YSxlKSxrLmFkZEVkZ2VzKHQuZWRnZXMsdC5yZWN0LGUpLGUueD0wLGUueT0wLCEwfWZ1bmN0aW9uIEplKHQpe3ZhciBlPXQueCxuPXQueTt0aGlzLm9mZnNldC5wZW5kaW5nLngrPWUsdGhpcy5vZmZzZXQucGVuZGluZy55Kz1uLHRoaXMub2Zmc2V0LnRvdGFsLngrPWUsdGhpcy5vZmZzZXQudG90YWwueSs9bn1mdW5jdGlvbiBRZSh0LGUpe3ZhciBuPXQucGFnZSxyPXQuY2xpZW50LG89ZS54LGk9ZS55O24ueCs9byxuLnkrPWksci54Kz1vLHIueSs9aX1PYmplY3QuZGVmaW5lUHJvcGVydHkoR2UsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksR2UuYWRkVG90YWw9SGUsR2UuYXBwbHlQZW5kaW5nPVplLEdlLmRlZmF1bHQ9dm9pZCAwLExlLl9Qcm94eU1ldGhvZHMub2Zmc2V0Qnk9XCJcIjt2YXIgdG49e2lkOlwib2Zmc2V0XCIsYmVmb3JlOltcIm1vZGlmaWVyc1wiLFwicG9pbnRlci1ldmVudHNcIixcImFjdGlvbnNcIixcImluZXJ0aWFcIl0saW5zdGFsbDpmdW5jdGlvbih0KXt0LkludGVyYWN0aW9uLnByb3RvdHlwZS5vZmZzZXRCeT1KZX0sbGlzdGVuZXJzOntcImludGVyYWN0aW9uczpuZXdcIjpmdW5jdGlvbih0KXt0LmludGVyYWN0aW9uLm9mZnNldD17dG90YWw6e3g6MCx5OjB9LHBlbmRpbmc6e3g6MCx5OjB9fX0sXCJpbnRlcmFjdGlvbnM6dXBkYXRlLXBvaW50ZXJcIjpmdW5jdGlvbih0KXtyZXR1cm4gSGUodC5pbnRlcmFjdGlvbil9LFwiaW50ZXJhY3Rpb25zOmJlZm9yZS1hY3Rpb24tc3RhcnRcIjpLZSxcImludGVyYWN0aW9uczpiZWZvcmUtYWN0aW9uLW1vdmVcIjpLZSxcImludGVyYWN0aW9uczpiZWZvcmUtYWN0aW9uLWVuZFwiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb247aWYoWmUoZSkpcmV0dXJuIGUubW92ZSh7b2Zmc2V0OiEwfSksZS5lbmQoKSwhMX0sXCJpbnRlcmFjdGlvbnM6c3RvcFwiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb247ZS5vZmZzZXQudG90YWwueD0wLGUub2Zmc2V0LnRvdGFsLnk9MCxlLm9mZnNldC5wZW5kaW5nLng9MCxlLm9mZnNldC5wZW5kaW5nLnk9MH19fTtHZS5kZWZhdWx0PXRuO3ZhciBlbj17fTtmdW5jdGlvbiBubih0LGUpe2Zvcih2YXIgbj0wO248ZS5sZW5ndGg7bisrKXt2YXIgcj1lW25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkodCxyLmtleSxyKX19ZnVuY3Rpb24gcm4odCxlLG4pe3JldHVybiBlIGluIHQ/T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsZSx7dmFsdWU6bixlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMH0pOnRbZV09bix0fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxlbi5kZWZhdWx0PWVuLkluZXJ0aWFTdGF0ZT12b2lkIDA7dmFyIG9uPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdChlKXshZnVuY3Rpb24odCxlKXtpZighKHQgaW5zdGFuY2VvZiBlKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfSh0aGlzLHQpLHJuKHRoaXMsXCJhY3RpdmVcIiwhMSkscm4odGhpcyxcImlzTW9kaWZpZWRcIiwhMSkscm4odGhpcyxcInNtb290aEVuZFwiLCExKSxybih0aGlzLFwiYWxsb3dSZXN1bWVcIiwhMSkscm4odGhpcyxcIm1vZGlmaWNhdGlvblwiLHZvaWQgMCkscm4odGhpcyxcIm1vZGlmaWVyQ291bnRcIiwwKSxybih0aGlzLFwibW9kaWZpZXJBcmdcIix2b2lkIDApLHJuKHRoaXMsXCJzdGFydENvb3Jkc1wiLHZvaWQgMCkscm4odGhpcyxcInQwXCIsMCkscm4odGhpcyxcInYwXCIsMCkscm4odGhpcyxcInRlXCIsMCkscm4odGhpcyxcInRhcmdldE9mZnNldFwiLHZvaWQgMCkscm4odGhpcyxcIm1vZGlmaWVkT2Zmc2V0XCIsdm9pZCAwKSxybih0aGlzLFwiY3VycmVudE9mZnNldFwiLHZvaWQgMCkscm4odGhpcyxcImxhbWJkYV92MFwiLDApLHJuKHRoaXMsXCJvbmVfdmVfdjBcIiwwKSxybih0aGlzLFwidGltZW91dFwiLHZvaWQgMCkscm4odGhpcyxcImludGVyYWN0aW9uXCIsdm9pZCAwKSx0aGlzLmludGVyYWN0aW9uPWV9dmFyIGUsbjtyZXR1cm4gZT10LChuPVt7a2V5Olwic3RhcnRcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10aGlzLmludGVyYWN0aW9uLG49YW4oZSk7aWYoIW58fCFuLmVuYWJsZWQpcmV0dXJuITE7dmFyIHI9ZS5jb29yZHMudmVsb2NpdHkuY2xpZW50LG89KDAsQy5kZWZhdWx0KShyLngsci55KSxpPXRoaXMubW9kaWZpY2F0aW9ufHwodGhpcy5tb2RpZmljYXRpb249bmV3IHllLmRlZmF1bHQoZSkpO2lmKGkuY29weUZyb20oZS5tb2RpZmljYXRpb24pLHRoaXMudDA9ZS5fbm93KCksdGhpcy5hbGxvd1Jlc3VtZT1uLmFsbG93UmVzdW1lLHRoaXMudjA9byx0aGlzLmN1cnJlbnRPZmZzZXQ9e3g6MCx5OjB9LHRoaXMuc3RhcnRDb29yZHM9ZS5jb29yZHMuY3VyLnBhZ2UsdGhpcy5tb2RpZmllckFyZz1pLmZpbGxBcmcoe3BhZ2VDb29yZHM6dGhpcy5zdGFydENvb3JkcyxwcmVFbmQ6ITAscGhhc2U6XCJpbmVydGlhc3RhcnRcIn0pLHRoaXMudDAtZS5jb29yZHMuY3VyLnRpbWVTdGFtcDw1MCYmbz5uLm1pblNwZWVkJiZvPm4uZW5kU3BlZWQpdGhpcy5zdGFydEluZXJ0aWEoKTtlbHNle2lmKGkucmVzdWx0PWkuc2V0QWxsKHRoaXMubW9kaWZpZXJBcmcpLCFpLnJlc3VsdC5jaGFuZ2VkKXJldHVybiExO3RoaXMuc3RhcnRTbW9vdGhFbmQoKX1yZXR1cm4gZS5tb2RpZmljYXRpb24ucmVzdWx0LnJlY3Q9bnVsbCxlLm9mZnNldEJ5KHRoaXMudGFyZ2V0T2Zmc2V0KSxlLl9kb1BoYXNlKHtpbnRlcmFjdGlvbjplLGV2ZW50OnQscGhhc2U6XCJpbmVydGlhc3RhcnRcIn0pLGUub2Zmc2V0Qnkoe3g6LXRoaXMudGFyZ2V0T2Zmc2V0LngseTotdGhpcy50YXJnZXRPZmZzZXQueX0pLGUubW9kaWZpY2F0aW9uLnJlc3VsdC5yZWN0PW51bGwsdGhpcy5hY3RpdmU9ITAsZS5zaW11bGF0aW9uPXRoaXMsITB9fSx7a2V5Olwic3RhcnRJbmVydGlhXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgdD10aGlzLGU9dGhpcy5pbnRlcmFjdGlvbi5jb29yZHMudmVsb2NpdHkuY2xpZW50LG49YW4odGhpcy5pbnRlcmFjdGlvbikscj1uLnJlc2lzdGFuY2Usbz0tTWF0aC5sb2cobi5lbmRTcGVlZC90aGlzLnYwKS9yO3RoaXMudGFyZ2V0T2Zmc2V0PXt4OihlLngtbykvcix5OihlLnktbykvcn0sdGhpcy50ZT1vLHRoaXMubGFtYmRhX3YwPXIvdGhpcy52MCx0aGlzLm9uZV92ZV92MD0xLW4uZW5kU3BlZWQvdGhpcy52MDt2YXIgaT10aGlzLm1vZGlmaWNhdGlvbixhPXRoaXMubW9kaWZpZXJBcmc7YS5wYWdlQ29vcmRzPXt4OnRoaXMuc3RhcnRDb29yZHMueCt0aGlzLnRhcmdldE9mZnNldC54LHk6dGhpcy5zdGFydENvb3Jkcy55K3RoaXMudGFyZ2V0T2Zmc2V0Lnl9LGkucmVzdWx0PWkuc2V0QWxsKGEpLGkucmVzdWx0LmNoYW5nZWQmJih0aGlzLmlzTW9kaWZpZWQ9ITAsdGhpcy5tb2RpZmllZE9mZnNldD17eDp0aGlzLnRhcmdldE9mZnNldC54K2kucmVzdWx0LmRlbHRhLngseTp0aGlzLnRhcmdldE9mZnNldC55K2kucmVzdWx0LmRlbHRhLnl9KSx0aGlzLm9uTmV4dEZyYW1lKChmdW5jdGlvbigpe3JldHVybiB0LmluZXJ0aWFUaWNrKCl9KSl9fSx7a2V5Olwic3RhcnRTbW9vdGhFbmRcIix2YWx1ZTpmdW5jdGlvbigpe3ZhciB0PXRoaXM7dGhpcy5zbW9vdGhFbmQ9ITAsdGhpcy5pc01vZGlmaWVkPSEwLHRoaXMudGFyZ2V0T2Zmc2V0PXt4OnRoaXMubW9kaWZpY2F0aW9uLnJlc3VsdC5kZWx0YS54LHk6dGhpcy5tb2RpZmljYXRpb24ucmVzdWx0LmRlbHRhLnl9LHRoaXMub25OZXh0RnJhbWUoKGZ1bmN0aW9uKCl7cmV0dXJuIHQuc21vb3RoRW5kVGljaygpfSkpfX0se2tleTpcIm9uTmV4dEZyYW1lXCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dGhpczt0aGlzLnRpbWVvdXQ9anQuZGVmYXVsdC5yZXF1ZXN0KChmdW5jdGlvbigpe2UuYWN0aXZlJiZ0KCl9KSl9fSx7a2V5OlwiaW5lcnRpYVRpY2tcIix2YWx1ZTpmdW5jdGlvbigpe3ZhciB0LGUsbixyLG8saT10aGlzLGE9dGhpcy5pbnRlcmFjdGlvbixzPWFuKGEpLnJlc2lzdGFuY2UsbD0oYS5fbm93KCktdGhpcy50MCkvMWUzO2lmKGw8dGhpcy50ZSl7dmFyIHUsYz0xLShNYXRoLmV4cCgtcypsKS10aGlzLmxhbWJkYV92MCkvdGhpcy5vbmVfdmVfdjA7dGhpcy5pc01vZGlmaWVkPygwLDAsdD10aGlzLnRhcmdldE9mZnNldC54LGU9dGhpcy50YXJnZXRPZmZzZXQueSxuPXRoaXMubW9kaWZpZWRPZmZzZXQueCxyPXRoaXMubW9kaWZpZWRPZmZzZXQueSx1PXt4OnNuKG89YywwLHQsbikseTpzbihvLDAsZSxyKX0pOnU9e3g6dGhpcy50YXJnZXRPZmZzZXQueCpjLHk6dGhpcy50YXJnZXRPZmZzZXQueSpjfTt2YXIgZj17eDp1LngtdGhpcy5jdXJyZW50T2Zmc2V0LngseTp1LnktdGhpcy5jdXJyZW50T2Zmc2V0Lnl9O3RoaXMuY3VycmVudE9mZnNldC54Kz1mLngsdGhpcy5jdXJyZW50T2Zmc2V0LnkrPWYueSxhLm9mZnNldEJ5KGYpLGEubW92ZSgpLHRoaXMub25OZXh0RnJhbWUoKGZ1bmN0aW9uKCl7cmV0dXJuIGkuaW5lcnRpYVRpY2soKX0pKX1lbHNlIGEub2Zmc2V0Qnkoe3g6dGhpcy5tb2RpZmllZE9mZnNldC54LXRoaXMuY3VycmVudE9mZnNldC54LHk6dGhpcy5tb2RpZmllZE9mZnNldC55LXRoaXMuY3VycmVudE9mZnNldC55fSksdGhpcy5lbmQoKX19LHtrZXk6XCJzbW9vdGhFbmRUaWNrXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgdD10aGlzLGU9dGhpcy5pbnRlcmFjdGlvbixuPWUuX25vdygpLXRoaXMudDAscj1hbihlKS5zbW9vdGhFbmREdXJhdGlvbjtpZihuPHIpe3ZhciBvPXt4OmxuKG4sMCx0aGlzLnRhcmdldE9mZnNldC54LHIpLHk6bG4obiwwLHRoaXMudGFyZ2V0T2Zmc2V0Lnkscil9LGk9e3g6by54LXRoaXMuY3VycmVudE9mZnNldC54LHk6by55LXRoaXMuY3VycmVudE9mZnNldC55fTt0aGlzLmN1cnJlbnRPZmZzZXQueCs9aS54LHRoaXMuY3VycmVudE9mZnNldC55Kz1pLnksZS5vZmZzZXRCeShpKSxlLm1vdmUoe3NraXBNb2RpZmllcnM6dGhpcy5tb2RpZmllckNvdW50fSksdGhpcy5vbk5leHRGcmFtZSgoZnVuY3Rpb24oKXtyZXR1cm4gdC5zbW9vdGhFbmRUaWNrKCl9KSl9ZWxzZSBlLm9mZnNldEJ5KHt4OnRoaXMudGFyZ2V0T2Zmc2V0LngtdGhpcy5jdXJyZW50T2Zmc2V0LngseTp0aGlzLnRhcmdldE9mZnNldC55LXRoaXMuY3VycmVudE9mZnNldC55fSksdGhpcy5lbmQoKX19LHtrZXk6XCJyZXN1bWVcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10LnBvaW50ZXIsbj10LmV2ZW50LHI9dC5ldmVudFRhcmdldCxvPXRoaXMuaW50ZXJhY3Rpb247by5vZmZzZXRCeSh7eDotdGhpcy5jdXJyZW50T2Zmc2V0LngseTotdGhpcy5jdXJyZW50T2Zmc2V0Lnl9KSxvLnVwZGF0ZVBvaW50ZXIoZSxuLHIsITApLG8uX2RvUGhhc2Uoe2ludGVyYWN0aW9uOm8sZXZlbnQ6bixwaGFzZTpcInJlc3VtZVwifSksKDAsQi5jb3B5Q29vcmRzKShvLmNvb3Jkcy5wcmV2LG8uY29vcmRzLmN1ciksdGhpcy5zdG9wKCl9fSx7a2V5OlwiZW5kXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLmludGVyYWN0aW9uLm1vdmUoKSx0aGlzLmludGVyYWN0aW9uLmVuZCgpLHRoaXMuc3RvcCgpfX0se2tleTpcInN0b3BcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuYWN0aXZlPXRoaXMuc21vb3RoRW5kPSExLHRoaXMuaW50ZXJhY3Rpb24uc2ltdWxhdGlvbj1udWxsLGp0LmRlZmF1bHQuY2FuY2VsKHRoaXMudGltZW91dCl9fV0pJiZubihlLnByb3RvdHlwZSxuKSx0fSgpO2Z1bmN0aW9uIGFuKHQpe3ZhciBlPXQuaW50ZXJhY3RhYmxlLG49dC5wcmVwYXJlZDtyZXR1cm4gZSYmZS5vcHRpb25zJiZuLm5hbWUmJmUub3B0aW9uc1tuLm5hbWVdLmluZXJ0aWF9ZnVuY3Rpb24gc24odCxlLG4scil7dmFyIG89MS10O3JldHVybiBvKm8qZSsyKm8qdCpuK3QqdCpyfWZ1bmN0aW9uIGxuKHQsZSxuLHIpe3JldHVybi1uKih0Lz1yKSoodC0yKStlfWVuLkluZXJ0aWFTdGF0ZT1vbjt2YXIgdW49e2lkOlwiaW5lcnRpYVwiLGJlZm9yZTpbXCJtb2RpZmllcnNcIixcImFjdGlvbnNcIl0saW5zdGFsbDpmdW5jdGlvbih0KXt2YXIgZT10LmRlZmF1bHRzO3QudXNlUGx1Z2luKEdlLmRlZmF1bHQpLHQudXNlUGx1Z2luKFNlLmRlZmF1bHQpLHQuYWN0aW9ucy5waGFzZXMuaW5lcnRpYXN0YXJ0PSEwLHQuYWN0aW9ucy5waGFzZXMucmVzdW1lPSEwLGUucGVyQWN0aW9uLmluZXJ0aWE9e2VuYWJsZWQ6ITEscmVzaXN0YW5jZToxMCxtaW5TcGVlZDoxMDAsZW5kU3BlZWQ6MTAsYWxsb3dSZXN1bWU6ITAsc21vb3RoRW5kRHVyYXRpb246MzAwfX0sbGlzdGVuZXJzOntcImludGVyYWN0aW9uczpuZXdcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uO2UuaW5lcnRpYT1uZXcgb24oZSl9LFwiaW50ZXJhY3Rpb25zOmJlZm9yZS1hY3Rpb24tZW5kXCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbixuPXQuZXZlbnQ7cmV0dXJuKCFlLl9pbnRlcmFjdGluZ3x8ZS5zaW11bGF0aW9ufHwhZS5pbmVydGlhLnN0YXJ0KG4pKSYmbnVsbH0sXCJpbnRlcmFjdGlvbnM6ZG93blwiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3Rpb24sbj10LmV2ZW50VGFyZ2V0LHI9ZS5pbmVydGlhO2lmKHIuYWN0aXZlKWZvcih2YXIgbz1uO2kuZGVmYXVsdC5lbGVtZW50KG8pOyl7aWYobz09PWUuZWxlbWVudCl7ci5yZXN1bWUodCk7YnJlYWt9bz1fLnBhcmVudE5vZGUobyl9fSxcImludGVyYWN0aW9uczpzdG9wXCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbi5pbmVydGlhO2UuYWN0aXZlJiZlLnN0b3AoKX0sXCJpbnRlcmFjdGlvbnM6YmVmb3JlLWFjdGlvbi1yZXN1bWVcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uLm1vZGlmaWNhdGlvbjtlLnN0b3AodCksZS5zdGFydCh0LHQuaW50ZXJhY3Rpb24uY29vcmRzLmN1ci5wYWdlKSxlLmFwcGx5VG9JbnRlcmFjdGlvbih0KX0sXCJpbnRlcmFjdGlvbnM6YmVmb3JlLWFjdGlvbi1pbmVydGlhc3RhcnRcIjpmdW5jdGlvbih0KXtyZXR1cm4gdC5pbnRlcmFjdGlvbi5tb2RpZmljYXRpb24uc2V0QW5kQXBwbHkodCl9LFwiaW50ZXJhY3Rpb25zOmFjdGlvbi1yZXN1bWVcIjpTZS5hZGRFdmVudE1vZGlmaWVycyxcImludGVyYWN0aW9uczphY3Rpb24taW5lcnRpYXN0YXJ0XCI6U2UuYWRkRXZlbnRNb2RpZmllcnMsXCJpbnRlcmFjdGlvbnM6YWZ0ZXItYWN0aW9uLWluZXJ0aWFzdGFydFwiOmZ1bmN0aW9uKHQpe3JldHVybiB0LmludGVyYWN0aW9uLm1vZGlmaWNhdGlvbi5yZXN0b3JlSW50ZXJhY3Rpb25Db29yZHModCl9LFwiaW50ZXJhY3Rpb25zOmFmdGVyLWFjdGlvbi1yZXN1bWVcIjpmdW5jdGlvbih0KXtyZXR1cm4gdC5pbnRlcmFjdGlvbi5tb2RpZmljYXRpb24ucmVzdG9yZUludGVyYWN0aW9uQ29vcmRzKHQpfX19O2VuLmRlZmF1bHQ9dW47dmFyIGNuPXt9O2Z1bmN0aW9uIGZuKHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHIua2V5LHIpfX1mdW5jdGlvbiBkbih0LGUsbil7cmV0dXJuIGUgaW4gdD9PYmplY3QuZGVmaW5lUHJvcGVydHkodCxlLHt2YWx1ZTpuLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwfSk6dFtlXT1uLHR9ZnVuY3Rpb24gcG4odCxlKXtmb3IodmFyIG49MDtuPGUubGVuZ3RoO24rKyl7dmFyIHI9ZVtuXTtpZih0LmltbWVkaWF0ZVByb3BhZ2F0aW9uU3RvcHBlZClicmVhaztyKHQpfX1PYmplY3QuZGVmaW5lUHJvcGVydHkoY24sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksY24uRXZlbnRhYmxlPXZvaWQgMDt2YXIgdm49ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KGUpeyFmdW5jdGlvbih0LGUpe2lmKCEodCBpbnN0YW5jZW9mIGUpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9KHRoaXMsdCksZG4odGhpcyxcIm9wdGlvbnNcIix2b2lkIDApLGRuKHRoaXMsXCJ0eXBlc1wiLHt9KSxkbih0aGlzLFwicHJvcGFnYXRpb25TdG9wcGVkXCIsITEpLGRuKHRoaXMsXCJpbW1lZGlhdGVQcm9wYWdhdGlvblN0b3BwZWRcIiwhMSksZG4odGhpcyxcImdsb2JhbFwiLHZvaWQgMCksdGhpcy5vcHRpb25zPSgwLGouZGVmYXVsdCkoe30sZXx8e30pfXZhciBlLG47cmV0dXJuIGU9dCwobj1be2tleTpcImZpcmVcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZSxuPXRoaXMuZ2xvYmFsOyhlPXRoaXMudHlwZXNbdC50eXBlXSkmJnBuKHQsZSksIXQucHJvcGFnYXRpb25TdG9wcGVkJiZuJiYoZT1uW3QudHlwZV0pJiZwbih0LGUpfX0se2tleTpcIm9uXCIsdmFsdWU6ZnVuY3Rpb24odCxlKXt2YXIgbj0oMCxSLmRlZmF1bHQpKHQsZSk7Zm9yKHQgaW4gbil0aGlzLnR5cGVzW3RdPVoubWVyZ2UodGhpcy50eXBlc1t0XXx8W10sblt0XSl9fSx7a2V5Olwib2ZmXCIsdmFsdWU6ZnVuY3Rpb24odCxlKXt2YXIgbj0oMCxSLmRlZmF1bHQpKHQsZSk7Zm9yKHQgaW4gbil7dmFyIHI9dGhpcy50eXBlc1t0XTtpZihyJiZyLmxlbmd0aClmb3IodmFyIG89MDtvPG5bdF0ubGVuZ3RoO28rKyl7dmFyIGk9blt0XVtvXSxhPXIuaW5kZXhPZihpKTstMSE9PWEmJnIuc3BsaWNlKGEsMSl9fX19LHtrZXk6XCJnZXRSZWN0XCIsdmFsdWU6ZnVuY3Rpb24odCl7cmV0dXJuIG51bGx9fV0pJiZmbihlLnByb3RvdHlwZSxuKSx0fSgpO2NuLkV2ZW50YWJsZT12bjt2YXIgaG49e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGhuLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGhuLmRlZmF1bHQ9ZnVuY3Rpb24odCxlKXtpZihlLnBoYXNlbGVzc1R5cGVzW3RdKXJldHVybiEwO2Zvcih2YXIgbiBpbiBlLm1hcClpZigwPT09dC5pbmRleE9mKG4pJiZ0LnN1YnN0cihuLmxlbmd0aClpbiBlLnBoYXNlcylyZXR1cm4hMDtyZXR1cm4hMX07dmFyIGduPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShnbixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxnbi5jcmVhdGVJbnRlcmFjdFN0YXRpYz1mdW5jdGlvbih0KXt2YXIgZT1mdW5jdGlvbiBlKG4scil7dmFyIG89dC5pbnRlcmFjdGFibGVzLmdldChuLHIpO3JldHVybiBvfHwoKG89dC5pbnRlcmFjdGFibGVzLm5ldyhuLHIpKS5ldmVudHMuZ2xvYmFsPWUuZ2xvYmFsRXZlbnRzKSxvfTtyZXR1cm4gZS5nZXRQb2ludGVyQXZlcmFnZT1CLnBvaW50ZXJBdmVyYWdlLGUuZ2V0VG91Y2hCQm94PUIudG91Y2hCQm94LGUuZ2V0VG91Y2hEaXN0YW5jZT1CLnRvdWNoRGlzdGFuY2UsZS5nZXRUb3VjaEFuZ2xlPUIudG91Y2hBbmdsZSxlLmdldEVsZW1lbnRSZWN0PV8uZ2V0RWxlbWVudFJlY3QsZS5nZXRFbGVtZW50Q2xpZW50UmVjdD1fLmdldEVsZW1lbnRDbGllbnRSZWN0LGUubWF0Y2hlc1NlbGVjdG9yPV8ubWF0Y2hlc1NlbGVjdG9yLGUuY2xvc2VzdD1fLmNsb3Nlc3QsZS5nbG9iYWxFdmVudHM9e30sZS52ZXJzaW9uPVwiMS4xMC4xMVwiLGUuc2NvcGU9dCxlLnVzZT1mdW5jdGlvbih0LGUpe3JldHVybiB0aGlzLnNjb3BlLnVzZVBsdWdpbih0LGUpLHRoaXN9LGUuaXNTZXQ9ZnVuY3Rpb24odCxlKXtyZXR1cm4hIXRoaXMuc2NvcGUuaW50ZXJhY3RhYmxlcy5nZXQodCxlJiZlLmNvbnRleHQpfSxlLm9uPSgwLFl0Lndhcm5PbmNlKSgoZnVuY3Rpb24odCxlLG4pe2lmKGkuZGVmYXVsdC5zdHJpbmcodCkmJi0xIT09dC5zZWFyY2goXCIgXCIpJiYodD10LnRyaW0oKS5zcGxpdCgvICsvKSksaS5kZWZhdWx0LmFycmF5KHQpKXtmb3IodmFyIHI9MDtyPHQubGVuZ3RoO3IrKyl7dmFyIG89dFtyXTt0aGlzLm9uKG8sZSxuKX1yZXR1cm4gdGhpc31pZihpLmRlZmF1bHQub2JqZWN0KHQpKXtmb3IodmFyIGEgaW4gdCl0aGlzLm9uKGEsdFthXSxlKTtyZXR1cm4gdGhpc31yZXR1cm4oMCxobi5kZWZhdWx0KSh0LHRoaXMuc2NvcGUuYWN0aW9ucyk/dGhpcy5nbG9iYWxFdmVudHNbdF0/dGhpcy5nbG9iYWxFdmVudHNbdF0ucHVzaChlKTp0aGlzLmdsb2JhbEV2ZW50c1t0XT1bZV06dGhpcy5zY29wZS5ldmVudHMuYWRkKHRoaXMuc2NvcGUuZG9jdW1lbnQsdCxlLHtvcHRpb25zOm59KSx0aGlzfSksXCJUaGUgaW50ZXJhY3Qub24oKSBtZXRob2QgaXMgYmVpbmcgZGVwcmVjYXRlZFwiKSxlLm9mZj0oMCxZdC53YXJuT25jZSkoKGZ1bmN0aW9uKHQsZSxuKXtpZihpLmRlZmF1bHQuc3RyaW5nKHQpJiYtMSE9PXQuc2VhcmNoKFwiIFwiKSYmKHQ9dC50cmltKCkuc3BsaXQoLyArLykpLGkuZGVmYXVsdC5hcnJheSh0KSl7Zm9yKHZhciByPTA7cjx0Lmxlbmd0aDtyKyspe3ZhciBvPXRbcl07dGhpcy5vZmYobyxlLG4pfXJldHVybiB0aGlzfWlmKGkuZGVmYXVsdC5vYmplY3QodCkpe2Zvcih2YXIgYSBpbiB0KXRoaXMub2ZmKGEsdFthXSxlKTtyZXR1cm4gdGhpc312YXIgcztyZXR1cm4oMCxobi5kZWZhdWx0KSh0LHRoaXMuc2NvcGUuYWN0aW9ucyk/dCBpbiB0aGlzLmdsb2JhbEV2ZW50cyYmLTEhPT0ocz10aGlzLmdsb2JhbEV2ZW50c1t0XS5pbmRleE9mKGUpKSYmdGhpcy5nbG9iYWxFdmVudHNbdF0uc3BsaWNlKHMsMSk6dGhpcy5zY29wZS5ldmVudHMucmVtb3ZlKHRoaXMuc2NvcGUuZG9jdW1lbnQsdCxlLG4pLHRoaXN9KSxcIlRoZSBpbnRlcmFjdC5vZmYoKSBtZXRob2QgaXMgYmVpbmcgZGVwcmVjYXRlZFwiKSxlLmRlYnVnPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuc2NvcGV9LGUuc3VwcG9ydHNUb3VjaD1mdW5jdGlvbigpe3JldHVybiBiLmRlZmF1bHQuc3VwcG9ydHNUb3VjaH0sZS5zdXBwb3J0c1BvaW50ZXJFdmVudD1mdW5jdGlvbigpe3JldHVybiBiLmRlZmF1bHQuc3VwcG9ydHNQb2ludGVyRXZlbnR9LGUuc3RvcD1mdW5jdGlvbigpe2Zvcih2YXIgdD0wO3Q8dGhpcy5zY29wZS5pbnRlcmFjdGlvbnMubGlzdC5sZW5ndGg7dCsrKXRoaXMuc2NvcGUuaW50ZXJhY3Rpb25zLmxpc3RbdF0uc3RvcCgpO3JldHVybiB0aGlzfSxlLnBvaW50ZXJNb3ZlVG9sZXJhbmNlPWZ1bmN0aW9uKHQpe3JldHVybiBpLmRlZmF1bHQubnVtYmVyKHQpPyh0aGlzLnNjb3BlLmludGVyYWN0aW9ucy5wb2ludGVyTW92ZVRvbGVyYW5jZT10LHRoaXMpOnRoaXMuc2NvcGUuaW50ZXJhY3Rpb25zLnBvaW50ZXJNb3ZlVG9sZXJhbmNlfSxlLmFkZERvY3VtZW50PWZ1bmN0aW9uKHQsZSl7dGhpcy5zY29wZS5hZGREb2N1bWVudCh0LGUpfSxlLnJlbW92ZURvY3VtZW50PWZ1bmN0aW9uKHQpe3RoaXMuc2NvcGUucmVtb3ZlRG9jdW1lbnQodCl9LGV9O3ZhciB5bj17fTtmdW5jdGlvbiBtbih0LGUpe2Zvcih2YXIgbj0wO248ZS5sZW5ndGg7bisrKXt2YXIgcj1lW25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkodCxyLmtleSxyKX19ZnVuY3Rpb24gYm4odCxlLG4pe3JldHVybiBlIGluIHQ/T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsZSx7dmFsdWU6bixlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMH0pOnRbZV09bix0fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh5bixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx5bi5JbnRlcmFjdGFibGU9dm9pZCAwO3ZhciB4bj1mdW5jdGlvbigpe2Z1bmN0aW9uIHQobixyLG8saSl7IWZ1bmN0aW9uKHQsZSl7aWYoISh0IGluc3RhbmNlb2YgZSkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX0odGhpcyx0KSxibih0aGlzLFwib3B0aW9uc1wiLHZvaWQgMCksYm4odGhpcyxcIl9hY3Rpb25zXCIsdm9pZCAwKSxibih0aGlzLFwidGFyZ2V0XCIsdm9pZCAwKSxibih0aGlzLFwiZXZlbnRzXCIsbmV3IGNuLkV2ZW50YWJsZSksYm4odGhpcyxcIl9jb250ZXh0XCIsdm9pZCAwKSxibih0aGlzLFwiX3dpblwiLHZvaWQgMCksYm4odGhpcyxcIl9kb2NcIix2b2lkIDApLGJuKHRoaXMsXCJfc2NvcGVFdmVudHNcIix2b2lkIDApLGJuKHRoaXMsXCJfcmVjdENoZWNrZXJcIix2b2lkIDApLHRoaXMuX2FjdGlvbnM9ci5hY3Rpb25zLHRoaXMudGFyZ2V0PW4sdGhpcy5fY29udGV4dD1yLmNvbnRleHR8fG8sdGhpcy5fd2luPSgwLGUuZ2V0V2luZG93KSgoMCxfLnRyeVNlbGVjdG9yKShuKT90aGlzLl9jb250ZXh0Om4pLHRoaXMuX2RvYz10aGlzLl93aW4uZG9jdW1lbnQsdGhpcy5fc2NvcGVFdmVudHM9aSx0aGlzLnNldChyKX12YXIgbixyO3JldHVybiBuPXQsKHI9W3trZXk6XCJfZGVmYXVsdHNcIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm57YmFzZTp7fSxwZXJBY3Rpb246e30sYWN0aW9uczp7fX19fSx7a2V5Olwic2V0T25FdmVudHNcIix2YWx1ZTpmdW5jdGlvbih0LGUpe3JldHVybiBpLmRlZmF1bHQuZnVuYyhlLm9uc3RhcnQpJiZ0aGlzLm9uKFwiXCIuY29uY2F0KHQsXCJzdGFydFwiKSxlLm9uc3RhcnQpLGkuZGVmYXVsdC5mdW5jKGUub25tb3ZlKSYmdGhpcy5vbihcIlwiLmNvbmNhdCh0LFwibW92ZVwiKSxlLm9ubW92ZSksaS5kZWZhdWx0LmZ1bmMoZS5vbmVuZCkmJnRoaXMub24oXCJcIi5jb25jYXQodCxcImVuZFwiKSxlLm9uZW5kKSxpLmRlZmF1bHQuZnVuYyhlLm9uaW5lcnRpYXN0YXJ0KSYmdGhpcy5vbihcIlwiLmNvbmNhdCh0LFwiaW5lcnRpYXN0YXJ0XCIpLGUub25pbmVydGlhc3RhcnQpLHRoaXN9fSx7a2V5OlwidXBkYXRlUGVyQWN0aW9uTGlzdGVuZXJzXCIsdmFsdWU6ZnVuY3Rpb24odCxlLG4peyhpLmRlZmF1bHQuYXJyYXkoZSl8fGkuZGVmYXVsdC5vYmplY3QoZSkpJiZ0aGlzLm9mZih0LGUpLChpLmRlZmF1bHQuYXJyYXkobil8fGkuZGVmYXVsdC5vYmplY3QobikpJiZ0aGlzLm9uKHQsbil9fSx7a2V5Olwic2V0UGVyQWN0aW9uXCIsdmFsdWU6ZnVuY3Rpb24odCxlKXt2YXIgbj10aGlzLl9kZWZhdWx0cztmb3IodmFyIHIgaW4gZSl7dmFyIG89cixhPXRoaXMub3B0aW9uc1t0XSxzPWVbb107XCJsaXN0ZW5lcnNcIj09PW8mJnRoaXMudXBkYXRlUGVyQWN0aW9uTGlzdGVuZXJzKHQsYS5saXN0ZW5lcnMscyksaS5kZWZhdWx0LmFycmF5KHMpP2Fbb109Wi5mcm9tKHMpOmkuZGVmYXVsdC5wbGFpbk9iamVjdChzKT8oYVtvXT0oMCxqLmRlZmF1bHQpKGFbb118fHt9LCgwLGdlLmRlZmF1bHQpKHMpKSxpLmRlZmF1bHQub2JqZWN0KG4ucGVyQWN0aW9uW29dKSYmXCJlbmFibGVkXCJpbiBuLnBlckFjdGlvbltvXSYmKGFbb10uZW5hYmxlZD0hMSE9PXMuZW5hYmxlZCkpOmkuZGVmYXVsdC5ib29sKHMpJiZpLmRlZmF1bHQub2JqZWN0KG4ucGVyQWN0aW9uW29dKT9hW29dLmVuYWJsZWQ9czphW29dPXN9fX0se2tleTpcImdldFJlY3RcIix2YWx1ZTpmdW5jdGlvbih0KXtyZXR1cm4gdD10fHwoaS5kZWZhdWx0LmVsZW1lbnQodGhpcy50YXJnZXQpP3RoaXMudGFyZ2V0Om51bGwpLGkuZGVmYXVsdC5zdHJpbmcodGhpcy50YXJnZXQpJiYodD10fHx0aGlzLl9jb250ZXh0LnF1ZXJ5U2VsZWN0b3IodGhpcy50YXJnZXQpKSwoMCxfLmdldEVsZW1lbnRSZWN0KSh0KX19LHtrZXk6XCJyZWN0Q2hlY2tlclwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXRoaXM7cmV0dXJuIGkuZGVmYXVsdC5mdW5jKHQpPyh0aGlzLl9yZWN0Q2hlY2tlcj10LHRoaXMuZ2V0UmVjdD1mdW5jdGlvbih0KXt2YXIgbj0oMCxqLmRlZmF1bHQpKHt9LGUuX3JlY3RDaGVja2VyKHQpKTtyZXR1cm5cIndpZHRoXCJpbiBufHwobi53aWR0aD1uLnJpZ2h0LW4ubGVmdCxuLmhlaWdodD1uLmJvdHRvbS1uLnRvcCksbn0sdGhpcyk6bnVsbD09PXQ/KGRlbGV0ZSB0aGlzLmdldFJlY3QsZGVsZXRlIHRoaXMuX3JlY3RDaGVja2VyLHRoaXMpOnRoaXMuZ2V0UmVjdH19LHtrZXk6XCJfYmFja0NvbXBhdE9wdGlvblwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7aWYoKDAsXy50cnlTZWxlY3RvcikoZSl8fGkuZGVmYXVsdC5vYmplY3QoZSkpe2Zvcih2YXIgbiBpbiB0aGlzLm9wdGlvbnNbdF09ZSx0aGlzLl9hY3Rpb25zLm1hcCl0aGlzLm9wdGlvbnNbbl1bdF09ZTtyZXR1cm4gdGhpc31yZXR1cm4gdGhpcy5vcHRpb25zW3RdfX0se2tleTpcIm9yaWdpblwiLHZhbHVlOmZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLl9iYWNrQ29tcGF0T3B0aW9uKFwib3JpZ2luXCIsdCl9fSx7a2V5OlwiZGVsdGFTb3VyY2VcIix2YWx1ZTpmdW5jdGlvbih0KXtyZXR1cm5cInBhZ2VcIj09PXR8fFwiY2xpZW50XCI9PT10Pyh0aGlzLm9wdGlvbnMuZGVsdGFTb3VyY2U9dCx0aGlzKTp0aGlzLm9wdGlvbnMuZGVsdGFTb3VyY2V9fSx7a2V5OlwiY29udGV4dFwiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2NvbnRleHR9fSx7a2V5OlwiaW5Db250ZXh0XCIsdmFsdWU6ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuX2NvbnRleHQ9PT10Lm93bmVyRG9jdW1lbnR8fCgwLF8ubm9kZUNvbnRhaW5zKSh0aGlzLl9jb250ZXh0LHQpfX0se2tleTpcInRlc3RJZ25vcmVBbGxvd1wiLHZhbHVlOmZ1bmN0aW9uKHQsZSxuKXtyZXR1cm4hdGhpcy50ZXN0SWdub3JlKHQuaWdub3JlRnJvbSxlLG4pJiZ0aGlzLnRlc3RBbGxvdyh0LmFsbG93RnJvbSxlLG4pfX0se2tleTpcInRlc3RBbGxvd1wiLHZhbHVlOmZ1bmN0aW9uKHQsZSxuKXtyZXR1cm4hdHx8ISFpLmRlZmF1bHQuZWxlbWVudChuKSYmKGkuZGVmYXVsdC5zdHJpbmcodCk/KDAsXy5tYXRjaGVzVXBUbykobix0LGUpOiEhaS5kZWZhdWx0LmVsZW1lbnQodCkmJigwLF8ubm9kZUNvbnRhaW5zKSh0LG4pKX19LHtrZXk6XCJ0ZXN0SWdub3JlXCIsdmFsdWU6ZnVuY3Rpb24odCxlLG4pe3JldHVybiEoIXR8fCFpLmRlZmF1bHQuZWxlbWVudChuKSkmJihpLmRlZmF1bHQuc3RyaW5nKHQpPygwLF8ubWF0Y2hlc1VwVG8pKG4sdCxlKTohIWkuZGVmYXVsdC5lbGVtZW50KHQpJiYoMCxfLm5vZGVDb250YWlucykodCxuKSl9fSx7a2V5OlwiZmlyZVwiLHZhbHVlOmZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLmV2ZW50cy5maXJlKHQpLHRoaXN9fSx7a2V5OlwiX29uT2ZmXCIsdmFsdWU6ZnVuY3Rpb24odCxlLG4scil7aS5kZWZhdWx0Lm9iamVjdChlKSYmIWkuZGVmYXVsdC5hcnJheShlKSYmKHI9bixuPW51bGwpO3ZhciBvPVwib25cIj09PXQ/XCJhZGRcIjpcInJlbW92ZVwiLGE9KDAsUi5kZWZhdWx0KShlLG4pO2Zvcih2YXIgcyBpbiBhKXtcIndoZWVsXCI9PT1zJiYocz1iLmRlZmF1bHQud2hlZWxFdmVudCk7Zm9yKHZhciBsPTA7bDxhW3NdLmxlbmd0aDtsKyspe3ZhciB1PWFbc11bbF07KDAsaG4uZGVmYXVsdCkocyx0aGlzLl9hY3Rpb25zKT90aGlzLmV2ZW50c1t0XShzLHUpOmkuZGVmYXVsdC5zdHJpbmcodGhpcy50YXJnZXQpP3RoaXMuX3Njb3BlRXZlbnRzW1wiXCIuY29uY2F0KG8sXCJEZWxlZ2F0ZVwiKV0odGhpcy50YXJnZXQsdGhpcy5fY29udGV4dCxzLHUscik6dGhpcy5fc2NvcGVFdmVudHNbb10odGhpcy50YXJnZXQscyx1LHIpfX1yZXR1cm4gdGhpc319LHtrZXk6XCJvblwiLHZhbHVlOmZ1bmN0aW9uKHQsZSxuKXtyZXR1cm4gdGhpcy5fb25PZmYoXCJvblwiLHQsZSxuKX19LHtrZXk6XCJvZmZcIix2YWx1ZTpmdW5jdGlvbih0LGUsbil7cmV0dXJuIHRoaXMuX29uT2ZmKFwib2ZmXCIsdCxlLG4pfX0se2tleTpcInNldFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuX2RlZmF1bHRzO2Zvcih2YXIgbiBpbiBpLmRlZmF1bHQub2JqZWN0KHQpfHwodD17fSksdGhpcy5vcHRpb25zPSgwLGdlLmRlZmF1bHQpKGUuYmFzZSksdGhpcy5fYWN0aW9ucy5tZXRob2REaWN0KXt2YXIgcj1uLG89dGhpcy5fYWN0aW9ucy5tZXRob2REaWN0W3JdO3RoaXMub3B0aW9uc1tyXT17fSx0aGlzLnNldFBlckFjdGlvbihyLCgwLGouZGVmYXVsdCkoKDAsai5kZWZhdWx0KSh7fSxlLnBlckFjdGlvbiksZS5hY3Rpb25zW3JdKSksdGhpc1tvXSh0W3JdKX1mb3IodmFyIGEgaW4gdClpLmRlZmF1bHQuZnVuYyh0aGlzW2FdKSYmdGhpc1thXSh0W2FdKTtyZXR1cm4gdGhpc319LHtrZXk6XCJ1bnNldFwiLHZhbHVlOmZ1bmN0aW9uKCl7aWYoaS5kZWZhdWx0LnN0cmluZyh0aGlzLnRhcmdldCkpZm9yKHZhciB0IGluIHRoaXMuX3Njb3BlRXZlbnRzLmRlbGVnYXRlZEV2ZW50cylmb3IodmFyIGU9dGhpcy5fc2NvcGVFdmVudHMuZGVsZWdhdGVkRXZlbnRzW3RdLG49ZS5sZW5ndGgtMTtuPj0wO24tLSl7dmFyIHI9ZVtuXSxvPXIuc2VsZWN0b3IsYT1yLmNvbnRleHQscz1yLmxpc3RlbmVycztvPT09dGhpcy50YXJnZXQmJmE9PT10aGlzLl9jb250ZXh0JiZlLnNwbGljZShuLDEpO2Zvcih2YXIgbD1zLmxlbmd0aC0xO2w+PTA7bC0tKXRoaXMuX3Njb3BlRXZlbnRzLnJlbW92ZURlbGVnYXRlKHRoaXMudGFyZ2V0LHRoaXMuX2NvbnRleHQsdCxzW2xdWzBdLHNbbF1bMV0pfWVsc2UgdGhpcy5fc2NvcGVFdmVudHMucmVtb3ZlKHRoaXMudGFyZ2V0LFwiYWxsXCIpfX1dKSYmbW4obi5wcm90b3R5cGUsciksdH0oKTt5bi5JbnRlcmFjdGFibGU9eG47dmFyIHduPXt9O2Z1bmN0aW9uIF9uKHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHIua2V5LHIpfX1mdW5jdGlvbiBQbih0LGUsbil7cmV0dXJuIGUgaW4gdD9PYmplY3QuZGVmaW5lUHJvcGVydHkodCxlLHt2YWx1ZTpuLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwfSk6dFtlXT1uLHR9T2JqZWN0LmRlZmluZVByb3BlcnR5KHduLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHduLkludGVyYWN0YWJsZVNldD12b2lkIDA7dmFyIE9uPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdChlKXt2YXIgbj10aGlzOyFmdW5jdGlvbih0LGUpe2lmKCEodCBpbnN0YW5jZW9mIGUpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9KHRoaXMsdCksUG4odGhpcyxcImxpc3RcIixbXSksUG4odGhpcyxcInNlbGVjdG9yTWFwXCIse30pLFBuKHRoaXMsXCJzY29wZVwiLHZvaWQgMCksdGhpcy5zY29wZT1lLGUuYWRkTGlzdGVuZXJzKHtcImludGVyYWN0YWJsZTp1bnNldFwiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuaW50ZXJhY3RhYmxlLHI9ZS50YXJnZXQsbz1lLl9jb250ZXh0LGE9aS5kZWZhdWx0LnN0cmluZyhyKT9uLnNlbGVjdG9yTWFwW3JdOnJbbi5zY29wZS5pZF0scz1aLmZpbmRJbmRleChhLChmdW5jdGlvbih0KXtyZXR1cm4gdC5jb250ZXh0PT09b30pKTthW3NdJiYoYVtzXS5jb250ZXh0PW51bGwsYVtzXS5pbnRlcmFjdGFibGU9bnVsbCksYS5zcGxpY2UocywxKX19KX12YXIgZSxuO3JldHVybiBlPXQsKG49W3trZXk6XCJuZXdcIix2YWx1ZTpmdW5jdGlvbih0LGUpe2U9KDAsai5kZWZhdWx0KShlfHx7fSx7YWN0aW9uczp0aGlzLnNjb3BlLmFjdGlvbnN9KTt2YXIgbj1uZXcgdGhpcy5zY29wZS5JbnRlcmFjdGFibGUodCxlLHRoaXMuc2NvcGUuZG9jdW1lbnQsdGhpcy5zY29wZS5ldmVudHMpLHI9e2NvbnRleHQ6bi5fY29udGV4dCxpbnRlcmFjdGFibGU6bn07cmV0dXJuIHRoaXMuc2NvcGUuYWRkRG9jdW1lbnQobi5fZG9jKSx0aGlzLmxpc3QucHVzaChuKSxpLmRlZmF1bHQuc3RyaW5nKHQpPyh0aGlzLnNlbGVjdG9yTWFwW3RdfHwodGhpcy5zZWxlY3Rvck1hcFt0XT1bXSksdGhpcy5zZWxlY3Rvck1hcFt0XS5wdXNoKHIpKToobi50YXJnZXRbdGhpcy5zY29wZS5pZF18fE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHRoaXMuc2NvcGUuaWQse3ZhbHVlOltdLGNvbmZpZ3VyYWJsZTohMH0pLHRbdGhpcy5zY29wZS5pZF0ucHVzaChyKSksdGhpcy5zY29wZS5maXJlKFwiaW50ZXJhY3RhYmxlOm5ld1wiLHt0YXJnZXQ6dCxvcHRpb25zOmUsaW50ZXJhY3RhYmxlOm4sd2luOnRoaXMuc2NvcGUuX3dpbn0pLG59fSx7a2V5OlwiZ2V0XCIsdmFsdWU6ZnVuY3Rpb24odCxlKXt2YXIgbj1lJiZlLmNvbnRleHR8fHRoaXMuc2NvcGUuZG9jdW1lbnQscj1pLmRlZmF1bHQuc3RyaW5nKHQpLG89cj90aGlzLnNlbGVjdG9yTWFwW3RdOnRbdGhpcy5zY29wZS5pZF07aWYoIW8pcmV0dXJuIG51bGw7dmFyIGE9Wi5maW5kKG8sKGZ1bmN0aW9uKGUpe3JldHVybiBlLmNvbnRleHQ9PT1uJiYocnx8ZS5pbnRlcmFjdGFibGUuaW5Db250ZXh0KHQpKX0pKTtyZXR1cm4gYSYmYS5pbnRlcmFjdGFibGV9fSx7a2V5OlwiZm9yRWFjaE1hdGNoXCIsdmFsdWU6ZnVuY3Rpb24odCxlKXtmb3IodmFyIG49MDtuPHRoaXMubGlzdC5sZW5ndGg7bisrKXt2YXIgcj10aGlzLmxpc3Rbbl0sbz12b2lkIDA7aWYoKGkuZGVmYXVsdC5zdHJpbmcoci50YXJnZXQpP2kuZGVmYXVsdC5lbGVtZW50KHQpJiZfLm1hdGNoZXNTZWxlY3Rvcih0LHIudGFyZ2V0KTp0PT09ci50YXJnZXQpJiZyLmluQ29udGV4dCh0KSYmKG89ZShyKSksdm9pZCAwIT09bylyZXR1cm4gb319fV0pJiZfbihlLnByb3RvdHlwZSxuKSx0fSgpO3duLkludGVyYWN0YWJsZVNldD1Pbjt2YXIgU249e307ZnVuY3Rpb24gRW4odCxlKXtmb3IodmFyIG49MDtuPGUubGVuZ3RoO24rKyl7dmFyIHI9ZVtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KHQsci5rZXkscil9fWZ1bmN0aW9uIFRuKHQsZSxuKXtyZXR1cm4gZSBpbiB0P09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LGUse3ZhbHVlOm4sZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITB9KTp0W2VdPW4sdH1mdW5jdGlvbiBNbih0LGUpe3JldHVybiBmdW5jdGlvbih0KXtpZihBcnJheS5pc0FycmF5KHQpKXJldHVybiB0fSh0KXx8ZnVuY3Rpb24odCxlKXtpZihcInVuZGVmaW5lZFwiIT10eXBlb2YgU3ltYm9sJiZTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KHQpKXt2YXIgbj1bXSxyPSEwLG89ITEsaT12b2lkIDA7dHJ5e2Zvcih2YXIgYSxzPXRbU3ltYm9sLml0ZXJhdG9yXSgpOyEocj0oYT1zLm5leHQoKSkuZG9uZSkmJihuLnB1c2goYS52YWx1ZSksIWV8fG4ubGVuZ3RoIT09ZSk7cj0hMCk7fWNhdGNoKHQpe289ITAsaT10fWZpbmFsbHl7dHJ5e3J8fG51bGw9PXMucmV0dXJufHxzLnJldHVybigpfWZpbmFsbHl7aWYobyl0aHJvdyBpfX1yZXR1cm4gbn19KHQsZSl8fGZ1bmN0aW9uKHQsZSl7aWYodCl7aWYoXCJzdHJpbmdcIj09dHlwZW9mIHQpcmV0dXJuIGpuKHQsZSk7dmFyIG49T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHQpLnNsaWNlKDgsLTEpO3JldHVyblwiT2JqZWN0XCI9PT1uJiZ0LmNvbnN0cnVjdG9yJiYobj10LmNvbnN0cnVjdG9yLm5hbWUpLFwiTWFwXCI9PT1ufHxcIlNldFwiPT09bj9BcnJheS5mcm9tKHQpOlwiQXJndW1lbnRzXCI9PT1ufHwvXig/OlVpfEkpbnQoPzo4fDE2fDMyKSg/OkNsYW1wZWQpP0FycmF5JC8udGVzdChuKT9qbih0LGUpOnZvaWQgMH19KHQsZSl8fGZ1bmN0aW9uKCl7dGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2UuXFxuSW4gb3JkZXIgdG8gYmUgaXRlcmFibGUsIG5vbi1hcnJheSBvYmplY3RzIG11c3QgaGF2ZSBhIFtTeW1ib2wuaXRlcmF0b3JdKCkgbWV0aG9kLlwiKX0oKX1mdW5jdGlvbiBqbih0LGUpeyhudWxsPT1lfHxlPnQubGVuZ3RoKSYmKGU9dC5sZW5ndGgpO2Zvcih2YXIgbj0wLHI9QXJyYXkoZSk7bjxlO24rKylyW25dPXRbbl07cmV0dXJuIHJ9T2JqZWN0LmRlZmluZVByb3BlcnR5KFNuLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLFNuLmRlZmF1bHQ9dm9pZCAwO3ZhciBrbj1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoZSl7IWZ1bmN0aW9uKHQsZSl7aWYoISh0IGluc3RhbmNlb2YgZSkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX0odGhpcyx0KSxUbih0aGlzLFwiY3VycmVudFRhcmdldFwiLHZvaWQgMCksVG4odGhpcyxcIm9yaWdpbmFsRXZlbnRcIix2b2lkIDApLFRuKHRoaXMsXCJ0eXBlXCIsdm9pZCAwKSx0aGlzLm9yaWdpbmFsRXZlbnQ9ZSwoMCxGLmRlZmF1bHQpKHRoaXMsZSl9dmFyIGUsbjtyZXR1cm4gZT10LChuPVt7a2V5OlwicHJldmVudE9yaWdpbmFsRGVmYXVsdFwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5vcmlnaW5hbEV2ZW50LnByZXZlbnREZWZhdWx0KCl9fSx7a2V5Olwic3RvcFByb3BhZ2F0aW9uXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLm9yaWdpbmFsRXZlbnQuc3RvcFByb3BhZ2F0aW9uKCl9fSx7a2V5Olwic3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLm9yaWdpbmFsRXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCl9fV0pJiZFbihlLnByb3RvdHlwZSxuKSx0fSgpO2Z1bmN0aW9uIEluKHQpe2lmKCFpLmRlZmF1bHQub2JqZWN0KHQpKXJldHVybntjYXB0dXJlOiEhdCxwYXNzaXZlOiExfTt2YXIgZT0oMCxqLmRlZmF1bHQpKHt9LHQpO3JldHVybiBlLmNhcHR1cmU9ISF0LmNhcHR1cmUsZS5wYXNzaXZlPSEhdC5wYXNzaXZlLGV9dmFyIERuPXtpZDpcImV2ZW50c1wiLGluc3RhbGw6ZnVuY3Rpb24odCl7dmFyIGUsbj1bXSxyPXt9LG89W10sYT17YWRkOnMscmVtb3ZlOmwsYWRkRGVsZWdhdGU6ZnVuY3Rpb24odCxlLG4saSxhKXt2YXIgbD1JbihhKTtpZighcltuXSl7cltuXT1bXTtmb3IodmFyIGY9MDtmPG8ubGVuZ3RoO2YrKyl7dmFyIGQ9b1tmXTtzKGQsbix1KSxzKGQsbixjLCEwKX19dmFyIHA9cltuXSx2PVouZmluZChwLChmdW5jdGlvbihuKXtyZXR1cm4gbi5zZWxlY3Rvcj09PXQmJm4uY29udGV4dD09PWV9KSk7dnx8KHY9e3NlbGVjdG9yOnQsY29udGV4dDplLGxpc3RlbmVyczpbXX0scC5wdXNoKHYpKSx2Lmxpc3RlbmVycy5wdXNoKFtpLGxdKX0scmVtb3ZlRGVsZWdhdGU6ZnVuY3Rpb24odCxlLG4sbyxpKXt2YXIgYSxzPUluKGkpLGY9cltuXSxkPSExO2lmKGYpZm9yKGE9Zi5sZW5ndGgtMTthPj0wO2EtLSl7dmFyIHA9ZlthXTtpZihwLnNlbGVjdG9yPT09dCYmcC5jb250ZXh0PT09ZSl7Zm9yKHZhciB2PXAubGlzdGVuZXJzLGg9di5sZW5ndGgtMTtoPj0wO2gtLSl7dmFyIGc9TW4odltoXSwyKSx5PWdbMF0sbT1nWzFdLGI9bS5jYXB0dXJlLHg9bS5wYXNzaXZlO2lmKHk9PT1vJiZiPT09cy5jYXB0dXJlJiZ4PT09cy5wYXNzaXZlKXt2LnNwbGljZShoLDEpLHYubGVuZ3RofHwoZi5zcGxpY2UoYSwxKSxsKGUsbix1KSxsKGUsbixjLCEwKSksZD0hMDticmVha319aWYoZClicmVha319fSxkZWxlZ2F0ZUxpc3RlbmVyOnUsZGVsZWdhdGVVc2VDYXB0dXJlOmMsZGVsZWdhdGVkRXZlbnRzOnIsZG9jdW1lbnRzOm8sdGFyZ2V0czpuLHN1cHBvcnRzT3B0aW9uczohMSxzdXBwb3J0c1Bhc3NpdmU6ITF9O2Z1bmN0aW9uIHModCxlLHIsbyl7dmFyIGk9SW4obykscz1aLmZpbmQobiwoZnVuY3Rpb24oZSl7cmV0dXJuIGUuZXZlbnRUYXJnZXQ9PT10fSkpO3N8fChzPXtldmVudFRhcmdldDp0LGV2ZW50czp7fX0sbi5wdXNoKHMpKSxzLmV2ZW50c1tlXXx8KHMuZXZlbnRzW2VdPVtdKSx0LmFkZEV2ZW50TGlzdGVuZXImJiFaLmNvbnRhaW5zKHMuZXZlbnRzW2VdLHIpJiYodC5hZGRFdmVudExpc3RlbmVyKGUscixhLnN1cHBvcnRzT3B0aW9ucz9pOmkuY2FwdHVyZSkscy5ldmVudHNbZV0ucHVzaChyKSl9ZnVuY3Rpb24gbCh0LGUscixvKXt2YXIgaT1JbihvKSxzPVouZmluZEluZGV4KG4sKGZ1bmN0aW9uKGUpe3JldHVybiBlLmV2ZW50VGFyZ2V0PT09dH0pKSx1PW5bc107aWYodSYmdS5ldmVudHMpaWYoXCJhbGxcIiE9PWUpe3ZhciBjPSExLGY9dS5ldmVudHNbZV07aWYoZil7aWYoXCJhbGxcIj09PXIpe2Zvcih2YXIgZD1mLmxlbmd0aC0xO2Q+PTA7ZC0tKWwodCxlLGZbZF0saSk7cmV0dXJufWZvcih2YXIgcD0wO3A8Zi5sZW5ndGg7cCsrKWlmKGZbcF09PT1yKXt0LnJlbW92ZUV2ZW50TGlzdGVuZXIoZSxyLGEuc3VwcG9ydHNPcHRpb25zP2k6aS5jYXB0dXJlKSxmLnNwbGljZShwLDEpLDA9PT1mLmxlbmd0aCYmKGRlbGV0ZSB1LmV2ZW50c1tlXSxjPSEwKTticmVha319YyYmIU9iamVjdC5rZXlzKHUuZXZlbnRzKS5sZW5ndGgmJm4uc3BsaWNlKHMsMSl9ZWxzZSBmb3IoZSBpbiB1LmV2ZW50cyl1LmV2ZW50cy5oYXNPd25Qcm9wZXJ0eShlKSYmbCh0LGUsXCJhbGxcIil9ZnVuY3Rpb24gdSh0LGUpe2Zvcih2YXIgbj1JbihlKSxvPW5ldyBrbih0KSxhPXJbdC50eXBlXSxzPU1uKEIuZ2V0RXZlbnRUYXJnZXRzKHQpLDEpWzBdLGw9cztpLmRlZmF1bHQuZWxlbWVudChsKTspe2Zvcih2YXIgdT0wO3U8YS5sZW5ndGg7dSsrKXt2YXIgYz1hW3VdLGY9Yy5zZWxlY3RvcixkPWMuY29udGV4dDtpZihfLm1hdGNoZXNTZWxlY3RvcihsLGYpJiZfLm5vZGVDb250YWlucyhkLHMpJiZfLm5vZGVDb250YWlucyhkLGwpKXt2YXIgcD1jLmxpc3RlbmVycztvLmN1cnJlbnRUYXJnZXQ9bDtmb3IodmFyIHY9MDt2PHAubGVuZ3RoO3YrKyl7dmFyIGg9TW4ocFt2XSwyKSxnPWhbMF0seT1oWzFdLG09eS5jYXB0dXJlLGI9eS5wYXNzaXZlO209PT1uLmNhcHR1cmUmJmI9PT1uLnBhc3NpdmUmJmcobyl9fX1sPV8ucGFyZW50Tm9kZShsKX19ZnVuY3Rpb24gYyh0KXtyZXR1cm4gdSh0LCEwKX1yZXR1cm4gbnVsbD09KGU9dC5kb2N1bWVudCl8fGUuY3JlYXRlRWxlbWVudChcImRpdlwiKS5hZGRFdmVudExpc3RlbmVyKFwidGVzdFwiLG51bGwse2dldCBjYXB0dXJlKCl7cmV0dXJuIGEuc3VwcG9ydHNPcHRpb25zPSEwfSxnZXQgcGFzc2l2ZSgpe3JldHVybiBhLnN1cHBvcnRzUGFzc2l2ZT0hMH19KSx0LmV2ZW50cz1hLGF9fTtTbi5kZWZhdWx0PURuO3ZhciBBbj17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoQW4sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksQW4uZGVmYXVsdD12b2lkIDA7dmFyIFJuPXttZXRob2RPcmRlcjpbXCJzaW11bGF0aW9uUmVzdW1lXCIsXCJtb3VzZU9yUGVuXCIsXCJoYXNQb2ludGVyXCIsXCJpZGxlXCJdLHNlYXJjaDpmdW5jdGlvbih0KXtmb3IodmFyIGU9MDtlPFJuLm1ldGhvZE9yZGVyLmxlbmd0aDtlKyspe3ZhciBuO249Um4ubWV0aG9kT3JkZXJbZV07dmFyIHI9Um5bbl0odCk7aWYocilyZXR1cm4gcn1yZXR1cm4gbnVsbH0sc2ltdWxhdGlvblJlc3VtZTpmdW5jdGlvbih0KXt2YXIgZT10LnBvaW50ZXJUeXBlLG49dC5ldmVudFR5cGUscj10LmV2ZW50VGFyZ2V0LG89dC5zY29wZTtpZighL2Rvd258c3RhcnQvaS50ZXN0KG4pKXJldHVybiBudWxsO2Zvcih2YXIgaT0wO2k8by5pbnRlcmFjdGlvbnMubGlzdC5sZW5ndGg7aSsrKXt2YXIgYT1vLmludGVyYWN0aW9ucy5saXN0W2ldLHM9cjtpZihhLnNpbXVsYXRpb24mJmEuc2ltdWxhdGlvbi5hbGxvd1Jlc3VtZSYmYS5wb2ludGVyVHlwZT09PWUpZm9yKDtzOyl7aWYocz09PWEuZWxlbWVudClyZXR1cm4gYTtzPV8ucGFyZW50Tm9kZShzKX19cmV0dXJuIG51bGx9LG1vdXNlT3JQZW46ZnVuY3Rpb24odCl7dmFyIGUsbj10LnBvaW50ZXJJZCxyPXQucG9pbnRlclR5cGUsbz10LmV2ZW50VHlwZSxpPXQuc2NvcGU7aWYoXCJtb3VzZVwiIT09ciYmXCJwZW5cIiE9PXIpcmV0dXJuIG51bGw7Zm9yKHZhciBhPTA7YTxpLmludGVyYWN0aW9ucy5saXN0Lmxlbmd0aDthKyspe3ZhciBzPWkuaW50ZXJhY3Rpb25zLmxpc3RbYV07aWYocy5wb2ludGVyVHlwZT09PXIpe2lmKHMuc2ltdWxhdGlvbiYmIXpuKHMsbikpY29udGludWU7aWYocy5pbnRlcmFjdGluZygpKXJldHVybiBzO2V8fChlPXMpfX1pZihlKXJldHVybiBlO2Zvcih2YXIgbD0wO2w8aS5pbnRlcmFjdGlvbnMubGlzdC5sZW5ndGg7bCsrKXt2YXIgdT1pLmludGVyYWN0aW9ucy5saXN0W2xdO2lmKCEodS5wb2ludGVyVHlwZSE9PXJ8fC9kb3duL2kudGVzdChvKSYmdS5zaW11bGF0aW9uKSlyZXR1cm4gdX1yZXR1cm4gbnVsbH0saGFzUG9pbnRlcjpmdW5jdGlvbih0KXtmb3IodmFyIGU9dC5wb2ludGVySWQsbj10LnNjb3BlLHI9MDtyPG4uaW50ZXJhY3Rpb25zLmxpc3QubGVuZ3RoO3IrKyl7dmFyIG89bi5pbnRlcmFjdGlvbnMubGlzdFtyXTtpZih6bihvLGUpKXJldHVybiBvfXJldHVybiBudWxsfSxpZGxlOmZ1bmN0aW9uKHQpe2Zvcih2YXIgZT10LnBvaW50ZXJUeXBlLG49dC5zY29wZSxyPTA7cjxuLmludGVyYWN0aW9ucy5saXN0Lmxlbmd0aDtyKyspe3ZhciBvPW4uaW50ZXJhY3Rpb25zLmxpc3Rbcl07aWYoMT09PW8ucG9pbnRlcnMubGVuZ3RoKXt2YXIgaT1vLmludGVyYWN0YWJsZTtpZihpJiYoIWkub3B0aW9ucy5nZXN0dXJlfHwhaS5vcHRpb25zLmdlc3R1cmUuZW5hYmxlZCkpY29udGludWV9ZWxzZSBpZihvLnBvaW50ZXJzLmxlbmd0aD49Miljb250aW51ZTtpZighby5pbnRlcmFjdGluZygpJiZlPT09by5wb2ludGVyVHlwZSlyZXR1cm4gb31yZXR1cm4gbnVsbH19O2Z1bmN0aW9uIHpuKHQsZSl7cmV0dXJuIHQucG9pbnRlcnMuc29tZSgoZnVuY3Rpb24odCl7cmV0dXJuIHQuaWQ9PT1lfSkpfXZhciBDbj1SbjtBbi5kZWZhdWx0PUNuO3ZhciBGbj17fTtmdW5jdGlvbiBYbih0KXtyZXR1cm4oWG49XCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZcInN5bWJvbFwiPT10eXBlb2YgU3ltYm9sLml0ZXJhdG9yP2Z1bmN0aW9uKHQpe3JldHVybiB0eXBlb2YgdH06ZnVuY3Rpb24odCl7cmV0dXJuIHQmJlwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmdC5jb25zdHJ1Y3Rvcj09PVN5bWJvbCYmdCE9PVN5bWJvbC5wcm90b3R5cGU/XCJzeW1ib2xcIjp0eXBlb2YgdH0pKHQpfWZ1bmN0aW9uIFluKHQsZSl7cmV0dXJuIGZ1bmN0aW9uKHQpe2lmKEFycmF5LmlzQXJyYXkodCkpcmV0dXJuIHR9KHQpfHxmdW5jdGlvbih0LGUpe2lmKFwidW5kZWZpbmVkXCIhPXR5cGVvZiBTeW1ib2wmJlN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QodCkpe3ZhciBuPVtdLHI9ITAsbz0hMSxpPXZvaWQgMDt0cnl7Zm9yKHZhciBhLHM9dFtTeW1ib2wuaXRlcmF0b3JdKCk7IShyPShhPXMubmV4dCgpKS5kb25lKSYmKG4ucHVzaChhLnZhbHVlKSwhZXx8bi5sZW5ndGghPT1lKTtyPSEwKTt9Y2F0Y2godCl7bz0hMCxpPXR9ZmluYWxseXt0cnl7cnx8bnVsbD09cy5yZXR1cm58fHMucmV0dXJuKCl9ZmluYWxseXtpZihvKXRocm93IGl9fXJldHVybiBufX0odCxlKXx8ZnVuY3Rpb24odCxlKXtpZih0KXtpZihcInN0cmluZ1wiPT10eXBlb2YgdClyZXR1cm4gQm4odCxlKTt2YXIgbj1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodCkuc2xpY2UoOCwtMSk7cmV0dXJuXCJPYmplY3RcIj09PW4mJnQuY29uc3RydWN0b3ImJihuPXQuY29uc3RydWN0b3IubmFtZSksXCJNYXBcIj09PW58fFwiU2V0XCI9PT1uP0FycmF5LmZyb20odCk6XCJBcmd1bWVudHNcIj09PW58fC9eKD86VWl8SSludCg/Ojh8MTZ8MzIpKD86Q2xhbXBlZCk/QXJyYXkkLy50ZXN0KG4pP0JuKHQsZSk6dm9pZCAwfX0odCxlKXx8ZnVuY3Rpb24oKXt0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZS5cXG5JbiBvcmRlciB0byBiZSBpdGVyYWJsZSwgbm9uLWFycmF5IG9iamVjdHMgbXVzdCBoYXZlIGEgW1N5bWJvbC5pdGVyYXRvcl0oKSBtZXRob2QuXCIpfSgpfWZ1bmN0aW9uIEJuKHQsZSl7KG51bGw9PWV8fGU+dC5sZW5ndGgpJiYoZT10Lmxlbmd0aCk7Zm9yKHZhciBuPTAscj1BcnJheShlKTtuPGU7bisrKXJbbl09dFtuXTtyZXR1cm4gcn1mdW5jdGlvbiBXbih0LGUpe2lmKCEodCBpbnN0YW5jZW9mIGUpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9ZnVuY3Rpb24gTG4odCxlKXtmb3IodmFyIG49MDtuPGUubGVuZ3RoO24rKyl7dmFyIHI9ZVtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KHQsci5rZXkscil9fWZ1bmN0aW9uIFVuKHQsZSl7cmV0dXJuKFVuPU9iamVjdC5zZXRQcm90b3R5cGVPZnx8ZnVuY3Rpb24odCxlKXtyZXR1cm4gdC5fX3Byb3RvX189ZSx0fSkodCxlKX1mdW5jdGlvbiBWbih0LGUpe3JldHVybiFlfHxcIm9iamVjdFwiIT09WG4oZSkmJlwiZnVuY3Rpb25cIiE9dHlwZW9mIGU/ZnVuY3Rpb24odCl7aWYodm9pZCAwPT09dCl0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7cmV0dXJuIHR9KHQpOmV9ZnVuY3Rpb24gTm4odCl7cmV0dXJuKE5uPU9iamVjdC5zZXRQcm90b3R5cGVPZj9PYmplY3QuZ2V0UHJvdG90eXBlT2Y6ZnVuY3Rpb24odCl7cmV0dXJuIHQuX19wcm90b19ffHxPYmplY3QuZ2V0UHJvdG90eXBlT2YodCl9KSh0KX1PYmplY3QuZGVmaW5lUHJvcGVydHkoRm4sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksRm4uZGVmYXVsdD12b2lkIDA7dmFyIHFuPVtcInBvaW50ZXJEb3duXCIsXCJwb2ludGVyTW92ZVwiLFwicG9pbnRlclVwXCIsXCJ1cGRhdGVQb2ludGVyXCIsXCJyZW1vdmVQb2ludGVyXCIsXCJ3aW5kb3dCbHVyXCJdO2Z1bmN0aW9uICRuKHQsZSl7cmV0dXJuIGZ1bmN0aW9uKG4pe3ZhciByPWUuaW50ZXJhY3Rpb25zLmxpc3Qsbz1CLmdldFBvaW50ZXJUeXBlKG4pLGk9WW4oQi5nZXRFdmVudFRhcmdldHMobiksMiksYT1pWzBdLHM9aVsxXSxsPVtdO2lmKC9edG91Y2gvLnRlc3Qobi50eXBlKSl7ZS5wcmV2VG91Y2hUaW1lPWUubm93KCk7Zm9yKHZhciB1PTA7dTxuLmNoYW5nZWRUb3VjaGVzLmxlbmd0aDt1Kyspe3ZhciBjPW4uY2hhbmdlZFRvdWNoZXNbdV0sZj17cG9pbnRlcjpjLHBvaW50ZXJJZDpCLmdldFBvaW50ZXJJZChjKSxwb2ludGVyVHlwZTpvLGV2ZW50VHlwZTpuLnR5cGUsZXZlbnRUYXJnZXQ6YSxjdXJFdmVudFRhcmdldDpzLHNjb3BlOmV9LGQ9R24oZik7bC5wdXNoKFtmLnBvaW50ZXIsZi5ldmVudFRhcmdldCxmLmN1ckV2ZW50VGFyZ2V0LGRdKX19ZWxzZXt2YXIgcD0hMTtpZighYi5kZWZhdWx0LnN1cHBvcnRzUG9pbnRlckV2ZW50JiYvbW91c2UvLnRlc3Qobi50eXBlKSl7Zm9yKHZhciB2PTA7djxyLmxlbmd0aCYmIXA7disrKXA9XCJtb3VzZVwiIT09clt2XS5wb2ludGVyVHlwZSYmclt2XS5wb2ludGVySXNEb3duO3A9cHx8ZS5ub3coKS1lLnByZXZUb3VjaFRpbWU8NTAwfHwwPT09bi50aW1lU3RhbXB9aWYoIXApe3ZhciBoPXtwb2ludGVyOm4scG9pbnRlcklkOkIuZ2V0UG9pbnRlcklkKG4pLHBvaW50ZXJUeXBlOm8sZXZlbnRUeXBlOm4udHlwZSxjdXJFdmVudFRhcmdldDpzLGV2ZW50VGFyZ2V0OmEsc2NvcGU6ZX0sZz1HbihoKTtsLnB1c2goW2gucG9pbnRlcixoLmV2ZW50VGFyZ2V0LGguY3VyRXZlbnRUYXJnZXQsZ10pfX1mb3IodmFyIHk9MDt5PGwubGVuZ3RoO3krKyl7dmFyIG09WW4obFt5XSw0KSx4PW1bMF0sdz1tWzFdLF89bVsyXTttWzNdW3RdKHgsbix3LF8pfX19ZnVuY3Rpb24gR24odCl7dmFyIGU9dC5wb2ludGVyVHlwZSxuPXQuc2NvcGUscj17aW50ZXJhY3Rpb246QW4uZGVmYXVsdC5zZWFyY2godCksc2VhcmNoRGV0YWlsczp0fTtyZXR1cm4gbi5maXJlKFwiaW50ZXJhY3Rpb25zOmZpbmRcIixyKSxyLmludGVyYWN0aW9ufHxuLmludGVyYWN0aW9ucy5uZXcoe3BvaW50ZXJUeXBlOmV9KX1mdW5jdGlvbiBIbih0LGUpe3ZhciBuPXQuZG9jLHI9dC5zY29wZSxvPXQub3B0aW9ucyxpPXIuaW50ZXJhY3Rpb25zLmRvY0V2ZW50cyxhPXIuZXZlbnRzLHM9YVtlXTtmb3IodmFyIGwgaW4gci5icm93c2VyLmlzSU9TJiYhby5ldmVudHMmJihvLmV2ZW50cz17cGFzc2l2ZTohMX0pLGEuZGVsZWdhdGVkRXZlbnRzKXMobixsLGEuZGVsZWdhdGVMaXN0ZW5lcikscyhuLGwsYS5kZWxlZ2F0ZVVzZUNhcHR1cmUsITApO2Zvcih2YXIgdT1vJiZvLmV2ZW50cyxjPTA7YzxpLmxlbmd0aDtjKyspe3ZhciBmPWlbY107cyhuLGYudHlwZSxmLmxpc3RlbmVyLHUpfX12YXIgS249e2lkOlwiY29yZS9pbnRlcmFjdGlvbnNcIixpbnN0YWxsOmZ1bmN0aW9uKHQpe2Zvcih2YXIgZT17fSxuPTA7bjxxbi5sZW5ndGg7bisrKXt2YXIgcj1xbltuXTtlW3JdPSRuKHIsdCl9dmFyIG8saT1iLmRlZmF1bHQucEV2ZW50VHlwZXM7ZnVuY3Rpb24gYSgpe2Zvcih2YXIgZT0wO2U8dC5pbnRlcmFjdGlvbnMubGlzdC5sZW5ndGg7ZSsrKXt2YXIgbj10LmludGVyYWN0aW9ucy5saXN0W2VdO2lmKG4ucG9pbnRlcklzRG93biYmXCJ0b3VjaFwiPT09bi5wb2ludGVyVHlwZSYmIW4uX2ludGVyYWN0aW5nKWZvcih2YXIgcj1mdW5jdGlvbigpe3ZhciBlPW4ucG9pbnRlcnNbb107dC5kb2N1bWVudHMuc29tZSgoZnVuY3Rpb24odCl7dmFyIG49dC5kb2M7cmV0dXJuKDAsXy5ub2RlQ29udGFpbnMpKG4sZS5kb3duVGFyZ2V0KX0pKXx8bi5yZW1vdmVQb2ludGVyKGUucG9pbnRlcixlLmV2ZW50KX0sbz0wO288bi5wb2ludGVycy5sZW5ndGg7bysrKXIoKX19KG89aC5kZWZhdWx0LlBvaW50ZXJFdmVudD9be3R5cGU6aS5kb3duLGxpc3RlbmVyOmF9LHt0eXBlOmkuZG93bixsaXN0ZW5lcjplLnBvaW50ZXJEb3dufSx7dHlwZTppLm1vdmUsbGlzdGVuZXI6ZS5wb2ludGVyTW92ZX0se3R5cGU6aS51cCxsaXN0ZW5lcjplLnBvaW50ZXJVcH0se3R5cGU6aS5jYW5jZWwsbGlzdGVuZXI6ZS5wb2ludGVyVXB9XTpbe3R5cGU6XCJtb3VzZWRvd25cIixsaXN0ZW5lcjplLnBvaW50ZXJEb3dufSx7dHlwZTpcIm1vdXNlbW92ZVwiLGxpc3RlbmVyOmUucG9pbnRlck1vdmV9LHt0eXBlOlwibW91c2V1cFwiLGxpc3RlbmVyOmUucG9pbnRlclVwfSx7dHlwZTpcInRvdWNoc3RhcnRcIixsaXN0ZW5lcjphfSx7dHlwZTpcInRvdWNoc3RhcnRcIixsaXN0ZW5lcjplLnBvaW50ZXJEb3dufSx7dHlwZTpcInRvdWNobW92ZVwiLGxpc3RlbmVyOmUucG9pbnRlck1vdmV9LHt0eXBlOlwidG91Y2hlbmRcIixsaXN0ZW5lcjplLnBvaW50ZXJVcH0se3R5cGU6XCJ0b3VjaGNhbmNlbFwiLGxpc3RlbmVyOmUucG9pbnRlclVwfV0pLnB1c2goe3R5cGU6XCJibHVyXCIsbGlzdGVuZXI6ZnVuY3Rpb24oZSl7Zm9yKHZhciBuPTA7bjx0LmludGVyYWN0aW9ucy5saXN0Lmxlbmd0aDtuKyspdC5pbnRlcmFjdGlvbnMubGlzdFtuXS5kb2N1bWVudEJsdXIoZSl9fSksdC5wcmV2VG91Y2hUaW1lPTAsdC5JbnRlcmFjdGlvbj1mdW5jdGlvbihlKXshZnVuY3Rpb24odCxlKXtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiBlJiZudWxsIT09ZSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb25cIik7dC5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShlJiZlLnByb3RvdHlwZSx7Y29uc3RydWN0b3I6e3ZhbHVlOnQsd3JpdGFibGU6ITAsY29uZmlndXJhYmxlOiEwfX0pLGUmJlVuKHQsZSl9KHMsZSk7dmFyIG4scixvLGksYT0obz1zLGk9ZnVuY3Rpb24oKXtpZihcInVuZGVmaW5lZFwiPT10eXBlb2YgUmVmbGVjdHx8IVJlZmxlY3QuY29uc3RydWN0KXJldHVybiExO2lmKFJlZmxlY3QuY29uc3RydWN0LnNoYW0pcmV0dXJuITE7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgUHJveHkpcmV0dXJuITA7dHJ5e3JldHVybiBCb29sZWFuLnByb3RvdHlwZS52YWx1ZU9mLmNhbGwoUmVmbGVjdC5jb25zdHJ1Y3QoQm9vbGVhbixbXSwoZnVuY3Rpb24oKXt9KSkpLCEwfWNhdGNoKHQpe3JldHVybiExfX0oKSxmdW5jdGlvbigpe3ZhciB0LGU9Tm4obyk7aWYoaSl7dmFyIG49Tm4odGhpcykuY29uc3RydWN0b3I7dD1SZWZsZWN0LmNvbnN0cnVjdChlLGFyZ3VtZW50cyxuKX1lbHNlIHQ9ZS5hcHBseSh0aGlzLGFyZ3VtZW50cyk7cmV0dXJuIFZuKHRoaXMsdCl9KTtmdW5jdGlvbiBzKCl7cmV0dXJuIFduKHRoaXMscyksYS5hcHBseSh0aGlzLGFyZ3VtZW50cyl9cmV0dXJuIG49cywocj1be2tleTpcInBvaW50ZXJNb3ZlVG9sZXJhbmNlXCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHQuaW50ZXJhY3Rpb25zLnBvaW50ZXJNb3ZlVG9sZXJhbmNlfSxzZXQ6ZnVuY3Rpb24oZSl7dC5pbnRlcmFjdGlvbnMucG9pbnRlck1vdmVUb2xlcmFuY2U9ZX19LHtrZXk6XCJfbm93XCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdC5ub3coKX19XSkmJkxuKG4ucHJvdG90eXBlLHIpLHN9KExlLmRlZmF1bHQpLHQuaW50ZXJhY3Rpb25zPXtsaXN0OltdLG5ldzpmdW5jdGlvbihlKXtlLnNjb3BlRmlyZT1mdW5jdGlvbihlLG4pe3JldHVybiB0LmZpcmUoZSxuKX07dmFyIG49bmV3IHQuSW50ZXJhY3Rpb24oZSk7cmV0dXJuIHQuaW50ZXJhY3Rpb25zLmxpc3QucHVzaChuKSxufSxsaXN0ZW5lcnM6ZSxkb2NFdmVudHM6byxwb2ludGVyTW92ZVRvbGVyYW5jZToxfSx0LnVzZVBsdWdpbihzZS5kZWZhdWx0KX0sbGlzdGVuZXJzOntcInNjb3BlOmFkZC1kb2N1bWVudFwiOmZ1bmN0aW9uKHQpe3JldHVybiBIbih0LFwiYWRkXCIpfSxcInNjb3BlOnJlbW92ZS1kb2N1bWVudFwiOmZ1bmN0aW9uKHQpe3JldHVybiBIbih0LFwicmVtb3ZlXCIpfSxcImludGVyYWN0YWJsZTp1bnNldFwiOmZ1bmN0aW9uKHQsZSl7Zm9yKHZhciBuPXQuaW50ZXJhY3RhYmxlLHI9ZS5pbnRlcmFjdGlvbnMubGlzdC5sZW5ndGgtMTtyPj0wO3ItLSl7dmFyIG89ZS5pbnRlcmFjdGlvbnMubGlzdFtyXTtvLmludGVyYWN0YWJsZT09PW4mJihvLnN0b3AoKSxlLmZpcmUoXCJpbnRlcmFjdGlvbnM6ZGVzdHJveVwiLHtpbnRlcmFjdGlvbjpvfSksby5kZXN0cm95KCksZS5pbnRlcmFjdGlvbnMubGlzdC5sZW5ndGg+MiYmZS5pbnRlcmFjdGlvbnMubGlzdC5zcGxpY2UociwxKSl9fX0sb25Eb2NTaWduYWw6SG4sZG9PbkludGVyYWN0aW9uczokbixtZXRob2ROYW1lczpxbn07Rm4uZGVmYXVsdD1Lbjt2YXIgWm49e307ZnVuY3Rpb24gSm4odCl7cmV0dXJuKEpuPVwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmXCJzeW1ib2xcIj09dHlwZW9mIFN5bWJvbC5pdGVyYXRvcj9mdW5jdGlvbih0KXtyZXR1cm4gdHlwZW9mIHR9OmZ1bmN0aW9uKHQpe3JldHVybiB0JiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJnQuY29uc3RydWN0b3I9PT1TeW1ib2wmJnQhPT1TeW1ib2wucHJvdG90eXBlP1wic3ltYm9sXCI6dHlwZW9mIHR9KSh0KX1mdW5jdGlvbiBRbih0LGUsbil7cmV0dXJuKFFuPVwidW5kZWZpbmVkXCIhPXR5cGVvZiBSZWZsZWN0JiZSZWZsZWN0LmdldD9SZWZsZWN0LmdldDpmdW5jdGlvbih0LGUsbil7dmFyIHI9ZnVuY3Rpb24odCxlKXtmb3IoOyFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodCxlKSYmbnVsbCE9PSh0PW5yKHQpKTspO3JldHVybiB0fSh0LGUpO2lmKHIpe3ZhciBvPU9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IocixlKTtyZXR1cm4gby5nZXQ/by5nZXQuY2FsbChuKTpvLnZhbHVlfX0pKHQsZSxufHx0KX1mdW5jdGlvbiB0cih0LGUpe3JldHVybih0cj1PYmplY3Quc2V0UHJvdG90eXBlT2Z8fGZ1bmN0aW9uKHQsZSl7cmV0dXJuIHQuX19wcm90b19fPWUsdH0pKHQsZSl9ZnVuY3Rpb24gZXIodCxlKXtyZXR1cm4hZXx8XCJvYmplY3RcIiE9PUpuKGUpJiZcImZ1bmN0aW9uXCIhPXR5cGVvZiBlP2Z1bmN0aW9uKHQpe2lmKHZvaWQgMD09PXQpdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO3JldHVybiB0fSh0KTplfWZ1bmN0aW9uIG5yKHQpe3JldHVybihucj1PYmplY3Quc2V0UHJvdG90eXBlT2Y/T2JqZWN0LmdldFByb3RvdHlwZU9mOmZ1bmN0aW9uKHQpe3JldHVybiB0Ll9fcHJvdG9fX3x8T2JqZWN0LmdldFByb3RvdHlwZU9mKHQpfSkodCl9ZnVuY3Rpb24gcnIodCxlKXtpZighKHQgaW5zdGFuY2VvZiBlKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfWZ1bmN0aW9uIG9yKHQsZSl7Zm9yKHZhciBuPTA7bjxlLmxlbmd0aDtuKyspe3ZhciByPWVbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHIua2V5LHIpfX1mdW5jdGlvbiBpcih0LGUsbil7cmV0dXJuIGUmJm9yKHQucHJvdG90eXBlLGUpLG4mJm9yKHQsbiksdH1mdW5jdGlvbiBhcih0LGUsbil7cmV0dXJuIGUgaW4gdD9PYmplY3QuZGVmaW5lUHJvcGVydHkodCxlLHt2YWx1ZTpuLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwfSk6dFtlXT1uLHR9T2JqZWN0LmRlZmluZVByb3BlcnR5KFpuLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLFpuLmluaXRTY29wZT1scixabi5TY29wZT12b2lkIDA7dmFyIHNyPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCgpe3ZhciBlPXRoaXM7cnIodGhpcyx0KSxhcih0aGlzLFwiaWRcIixcIl9faW50ZXJhY3Rfc2NvcGVfXCIuY29uY2F0KE1hdGguZmxvb3IoMTAwKk1hdGgucmFuZG9tKCkpKSksYXIodGhpcyxcImlzSW5pdGlhbGl6ZWRcIiwhMSksYXIodGhpcyxcImxpc3RlbmVyTWFwc1wiLFtdKSxhcih0aGlzLFwiYnJvd3NlclwiLGIuZGVmYXVsdCksYXIodGhpcyxcImRlZmF1bHRzXCIsKDAsZ2UuZGVmYXVsdCkoTWUuZGVmYXVsdHMpKSxhcih0aGlzLFwiRXZlbnRhYmxlXCIsY24uRXZlbnRhYmxlKSxhcih0aGlzLFwiYWN0aW9uc1wiLHttYXA6e30scGhhc2VzOntzdGFydDohMCxtb3ZlOiEwLGVuZDohMH0sbWV0aG9kRGljdDp7fSxwaGFzZWxlc3NUeXBlczp7fX0pLGFyKHRoaXMsXCJpbnRlcmFjdFN0YXRpY1wiLCgwLGduLmNyZWF0ZUludGVyYWN0U3RhdGljKSh0aGlzKSksYXIodGhpcyxcIkludGVyYWN0RXZlbnRcIixqZS5JbnRlcmFjdEV2ZW50KSxhcih0aGlzLFwiSW50ZXJhY3RhYmxlXCIsdm9pZCAwKSxhcih0aGlzLFwiaW50ZXJhY3RhYmxlc1wiLG5ldyB3bi5JbnRlcmFjdGFibGVTZXQodGhpcykpLGFyKHRoaXMsXCJfd2luXCIsdm9pZCAwKSxhcih0aGlzLFwiZG9jdW1lbnRcIix2b2lkIDApLGFyKHRoaXMsXCJ3aW5kb3dcIix2b2lkIDApLGFyKHRoaXMsXCJkb2N1bWVudHNcIixbXSksYXIodGhpcyxcIl9wbHVnaW5zXCIse2xpc3Q6W10sbWFwOnt9fSksYXIodGhpcyxcIm9uV2luZG93VW5sb2FkXCIsKGZ1bmN0aW9uKHQpe3JldHVybiBlLnJlbW92ZURvY3VtZW50KHQudGFyZ2V0KX0pKTt2YXIgbj10aGlzO3RoaXMuSW50ZXJhY3RhYmxlPWZ1bmN0aW9uKHQpeyFmdW5jdGlvbih0LGUpe2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIGUmJm51bGwhPT1lKXRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvblwiKTt0LnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUmJmUucHJvdG90eXBlLHtjb25zdHJ1Y3Rvcjp7dmFsdWU6dCx3cml0YWJsZTohMCxjb25maWd1cmFibGU6ITB9fSksZSYmdHIodCxlKX0oaSx0KTt2YXIgZSxyLG89KGU9aSxyPWZ1bmN0aW9uKCl7aWYoXCJ1bmRlZmluZWRcIj09dHlwZW9mIFJlZmxlY3R8fCFSZWZsZWN0LmNvbnN0cnVjdClyZXR1cm4hMTtpZihSZWZsZWN0LmNvbnN0cnVjdC5zaGFtKXJldHVybiExO2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIFByb3h5KXJldHVybiEwO3RyeXtyZXR1cm4gQm9vbGVhbi5wcm90b3R5cGUudmFsdWVPZi5jYWxsKFJlZmxlY3QuY29uc3RydWN0KEJvb2xlYW4sW10sKGZ1bmN0aW9uKCl7fSkpKSwhMH1jYXRjaCh0KXtyZXR1cm4hMX19KCksZnVuY3Rpb24oKXt2YXIgdCxuPW5yKGUpO2lmKHIpe3ZhciBvPW5yKHRoaXMpLmNvbnN0cnVjdG9yO3Q9UmVmbGVjdC5jb25zdHJ1Y3Qobixhcmd1bWVudHMsbyl9ZWxzZSB0PW4uYXBwbHkodGhpcyxhcmd1bWVudHMpO3JldHVybiBlcih0aGlzLHQpfSk7ZnVuY3Rpb24gaSgpe3JldHVybiBycih0aGlzLGkpLG8uYXBwbHkodGhpcyxhcmd1bWVudHMpfXJldHVybiBpcihpLFt7a2V5OlwiX2RlZmF1bHRzXCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIG4uZGVmYXVsdHN9fSx7a2V5Olwic2V0XCIsdmFsdWU6ZnVuY3Rpb24odCl7cmV0dXJuIFFuKG5yKGkucHJvdG90eXBlKSxcInNldFwiLHRoaXMpLmNhbGwodGhpcyx0KSxuLmZpcmUoXCJpbnRlcmFjdGFibGU6c2V0XCIse29wdGlvbnM6dCxpbnRlcmFjdGFibGU6dGhpc30pLHRoaXN9fSx7a2V5OlwidW5zZXRcIix2YWx1ZTpmdW5jdGlvbigpe1FuKG5yKGkucHJvdG90eXBlKSxcInVuc2V0XCIsdGhpcykuY2FsbCh0aGlzKSxuLmludGVyYWN0YWJsZXMubGlzdC5zcGxpY2Uobi5pbnRlcmFjdGFibGVzLmxpc3QuaW5kZXhPZih0aGlzKSwxKSxuLmZpcmUoXCJpbnRlcmFjdGFibGU6dW5zZXRcIix7aW50ZXJhY3RhYmxlOnRoaXN9KX19XSksaX0oeW4uSW50ZXJhY3RhYmxlKX1yZXR1cm4gaXIodCxbe2tleTpcImFkZExpc3RlbmVyc1wiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7dGhpcy5saXN0ZW5lck1hcHMucHVzaCh7aWQ6ZSxtYXA6dH0pfX0se2tleTpcImZpcmVcIix2YWx1ZTpmdW5jdGlvbih0LGUpe2Zvcih2YXIgbj0wO248dGhpcy5saXN0ZW5lck1hcHMubGVuZ3RoO24rKyl7dmFyIHI9dGhpcy5saXN0ZW5lck1hcHNbbl0ubWFwW3RdO2lmKHImJiExPT09cihlLHRoaXMsdCkpcmV0dXJuITF9fX0se2tleTpcImluaXRcIix2YWx1ZTpmdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5pc0luaXRpYWxpemVkP3RoaXM6bHIodGhpcyx0KX19LHtrZXk6XCJwbHVnaW5Jc0luc3RhbGxlZFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLl9wbHVnaW5zLm1hcFt0LmlkXXx8LTEhPT10aGlzLl9wbHVnaW5zLmxpc3QuaW5kZXhPZih0KX19LHtrZXk6XCJ1c2VQbHVnaW5cIix2YWx1ZTpmdW5jdGlvbih0LGUpe2lmKCF0aGlzLmlzSW5pdGlhbGl6ZWQpcmV0dXJuIHRoaXM7aWYodGhpcy5wbHVnaW5Jc0luc3RhbGxlZCh0KSlyZXR1cm4gdGhpcztpZih0LmlkJiYodGhpcy5fcGx1Z2lucy5tYXBbdC5pZF09dCksdGhpcy5fcGx1Z2lucy5saXN0LnB1c2godCksdC5pbnN0YWxsJiZ0Lmluc3RhbGwodGhpcyxlKSx0Lmxpc3RlbmVycyYmdC5iZWZvcmUpe2Zvcih2YXIgbj0wLHI9dGhpcy5saXN0ZW5lck1hcHMubGVuZ3RoLG89dC5iZWZvcmUucmVkdWNlKChmdW5jdGlvbih0LGUpe3JldHVybiB0W2VdPSEwLHRbdXIoZSldPSEwLHR9KSx7fSk7bjxyO24rKyl7dmFyIGk9dGhpcy5saXN0ZW5lck1hcHNbbl0uaWQ7aWYob1tpXXx8b1t1cihpKV0pYnJlYWt9dGhpcy5saXN0ZW5lck1hcHMuc3BsaWNlKG4sMCx7aWQ6dC5pZCxtYXA6dC5saXN0ZW5lcnN9KX1lbHNlIHQubGlzdGVuZXJzJiZ0aGlzLmxpc3RlbmVyTWFwcy5wdXNoKHtpZDp0LmlkLG1hcDp0Lmxpc3RlbmVyc30pO3JldHVybiB0aGlzfX0se2tleTpcImFkZERvY3VtZW50XCIsdmFsdWU6ZnVuY3Rpb24odCxuKXtpZigtMSE9PXRoaXMuZ2V0RG9jSW5kZXgodCkpcmV0dXJuITE7dmFyIHI9ZS5nZXRXaW5kb3codCk7bj1uPygwLGouZGVmYXVsdCkoe30sbik6e30sdGhpcy5kb2N1bWVudHMucHVzaCh7ZG9jOnQsb3B0aW9uczpufSksdGhpcy5ldmVudHMuZG9jdW1lbnRzLnB1c2godCksdCE9PXRoaXMuZG9jdW1lbnQmJnRoaXMuZXZlbnRzLmFkZChyLFwidW5sb2FkXCIsdGhpcy5vbldpbmRvd1VubG9hZCksdGhpcy5maXJlKFwic2NvcGU6YWRkLWRvY3VtZW50XCIse2RvYzp0LHdpbmRvdzpyLHNjb3BlOnRoaXMsb3B0aW9uczpufSl9fSx7a2V5OlwicmVtb3ZlRG9jdW1lbnRcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgbj10aGlzLmdldERvY0luZGV4KHQpLHI9ZS5nZXRXaW5kb3codCksbz10aGlzLmRvY3VtZW50c1tuXS5vcHRpb25zO3RoaXMuZXZlbnRzLnJlbW92ZShyLFwidW5sb2FkXCIsdGhpcy5vbldpbmRvd1VubG9hZCksdGhpcy5kb2N1bWVudHMuc3BsaWNlKG4sMSksdGhpcy5ldmVudHMuZG9jdW1lbnRzLnNwbGljZShuLDEpLHRoaXMuZmlyZShcInNjb3BlOnJlbW92ZS1kb2N1bWVudFwiLHtkb2M6dCx3aW5kb3c6cixzY29wZTp0aGlzLG9wdGlvbnM6b30pfX0se2tleTpcImdldERvY0luZGV4XCIsdmFsdWU6ZnVuY3Rpb24odCl7Zm9yKHZhciBlPTA7ZTx0aGlzLmRvY3VtZW50cy5sZW5ndGg7ZSsrKWlmKHRoaXMuZG9jdW1lbnRzW2VdLmRvYz09PXQpcmV0dXJuIGU7cmV0dXJuLTF9fSx7a2V5OlwiZ2V0RG9jT3B0aW9uc1wiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuZ2V0RG9jSW5kZXgodCk7cmV0dXJuLTE9PT1lP251bGw6dGhpcy5kb2N1bWVudHNbZV0ub3B0aW9uc319LHtrZXk6XCJub3dcIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybih0aGlzLndpbmRvdy5EYXRlfHxEYXRlKS5ub3coKX19XSksdH0oKTtmdW5jdGlvbiBscih0LG4pe3JldHVybiB0LmlzSW5pdGlhbGl6ZWQ9ITAsaS5kZWZhdWx0LndpbmRvdyhuKSYmZS5pbml0KG4pLGguZGVmYXVsdC5pbml0KG4pLGIuZGVmYXVsdC5pbml0KG4pLGp0LmRlZmF1bHQuaW5pdChuKSx0LndpbmRvdz1uLHQuZG9jdW1lbnQ9bi5kb2N1bWVudCx0LnVzZVBsdWdpbihGbi5kZWZhdWx0KSx0LnVzZVBsdWdpbihTbi5kZWZhdWx0KSx0fWZ1bmN0aW9uIHVyKHQpe3JldHVybiB0JiZ0LnJlcGxhY2UoL1xcLy4qJC8sXCJcIil9Wm4uU2NvcGU9c3I7dmFyIGNyPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShjcixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxjci5kZWZhdWx0PXZvaWQgMDt2YXIgZnI9bmV3IFpuLlNjb3BlLGRyPWZyLmludGVyYWN0U3RhdGljO2NyLmRlZmF1bHQ9ZHI7dmFyIHByPVwidW5kZWZpbmVkXCIhPXR5cGVvZiBnbG9iYWxUaGlzP2dsb2JhbFRoaXM6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdz93aW5kb3c6dm9pZCAwO2ZyLmluaXQocHIpO3ZhciB2cj17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkodnIsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdnIuZGVmYXVsdD12b2lkIDAsdnIuZGVmYXVsdD1mdW5jdGlvbigpe307dmFyIGhyPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShocixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxoci5kZWZhdWx0PXZvaWQgMCxoci5kZWZhdWx0PWZ1bmN0aW9uKCl7fTt2YXIgZ3I9e307ZnVuY3Rpb24geXIodCxlKXtyZXR1cm4gZnVuY3Rpb24odCl7aWYoQXJyYXkuaXNBcnJheSh0KSlyZXR1cm4gdH0odCl8fGZ1bmN0aW9uKHQsZSl7aWYoXCJ1bmRlZmluZWRcIiE9dHlwZW9mIFN5bWJvbCYmU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdCh0KSl7dmFyIG49W10scj0hMCxvPSExLGk9dm9pZCAwO3RyeXtmb3IodmFyIGEscz10W1N5bWJvbC5pdGVyYXRvcl0oKTshKHI9KGE9cy5uZXh0KCkpLmRvbmUpJiYobi5wdXNoKGEudmFsdWUpLCFlfHxuLmxlbmd0aCE9PWUpO3I9ITApO31jYXRjaCh0KXtvPSEwLGk9dH1maW5hbGx5e3RyeXtyfHxudWxsPT1zLnJldHVybnx8cy5yZXR1cm4oKX1maW5hbGx5e2lmKG8pdGhyb3cgaX19cmV0dXJuIG59fSh0LGUpfHxmdW5jdGlvbih0LGUpe2lmKHQpe2lmKFwic3RyaW5nXCI9PXR5cGVvZiB0KXJldHVybiBtcih0LGUpO3ZhciBuPU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0KS5zbGljZSg4LC0xKTtyZXR1cm5cIk9iamVjdFwiPT09biYmdC5jb25zdHJ1Y3RvciYmKG49dC5jb25zdHJ1Y3Rvci5uYW1lKSxcIk1hcFwiPT09bnx8XCJTZXRcIj09PW4/QXJyYXkuZnJvbSh0KTpcIkFyZ3VtZW50c1wiPT09bnx8L14oPzpVaXxJKW50KD86OHwxNnwzMikoPzpDbGFtcGVkKT9BcnJheSQvLnRlc3Qobik/bXIodCxlKTp2b2lkIDB9fSh0LGUpfHxmdW5jdGlvbigpe3Rocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlLlxcbkluIG9yZGVyIHRvIGJlIGl0ZXJhYmxlLCBub24tYXJyYXkgb2JqZWN0cyBtdXN0IGhhdmUgYSBbU3ltYm9sLml0ZXJhdG9yXSgpIG1ldGhvZC5cIil9KCl9ZnVuY3Rpb24gbXIodCxlKXsobnVsbD09ZXx8ZT50Lmxlbmd0aCkmJihlPXQubGVuZ3RoKTtmb3IodmFyIG49MCxyPUFycmF5KGUpO248ZTtuKyspcltuXT10W25dO3JldHVybiByfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShncixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxnci5kZWZhdWx0PXZvaWQgMCxnci5kZWZhdWx0PWZ1bmN0aW9uKHQpe3ZhciBlPVtbXCJ4XCIsXCJ5XCJdLFtcImxlZnRcIixcInRvcFwiXSxbXCJyaWdodFwiLFwiYm90dG9tXCJdLFtcIndpZHRoXCIsXCJoZWlnaHRcIl1dLmZpbHRlcigoZnVuY3Rpb24oZSl7dmFyIG49eXIoZSwyKSxyPW5bMF0sbz1uWzFdO3JldHVybiByIGluIHR8fG8gaW4gdH0pKSxuPWZ1bmN0aW9uKG4scil7Zm9yKHZhciBvPXQucmFuZ2UsaT10LmxpbWl0cyxhPXZvaWQgMD09PWk/e2xlZnQ6LTEvMCxyaWdodDoxLzAsdG9wOi0xLzAsYm90dG9tOjEvMH06aSxzPXQub2Zmc2V0LGw9dm9pZCAwPT09cz97eDowLHk6MH06cyx1PXtyYW5nZTpvLGdyaWQ6dCx4Om51bGwseTpudWxsfSxjPTA7YzxlLmxlbmd0aDtjKyspe3ZhciBmPXlyKGVbY10sMiksZD1mWzBdLHA9ZlsxXSx2PU1hdGgucm91bmQoKG4tbC54KS90W2RdKSxoPU1hdGgucm91bmQoKHItbC55KS90W3BdKTt1W2RdPU1hdGgubWF4KGEubGVmdCxNYXRoLm1pbihhLnJpZ2h0LHYqdFtkXStsLngpKSx1W3BdPU1hdGgubWF4KGEudG9wLE1hdGgubWluKGEuYm90dG9tLGgqdFtwXStsLnkpKX1yZXR1cm4gdX07cmV0dXJuIG4uZ3JpZD10LG4uY29vcmRGaWVsZHM9ZSxufTt2YXIgYnI9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KGJyLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShicixcImVkZ2VUYXJnZXRcIix7ZW51bWVyYWJsZTohMCxnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdnIuZGVmYXVsdH19KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoYnIsXCJlbGVtZW50c1wiLHtlbnVtZXJhYmxlOiEwLGdldDpmdW5jdGlvbigpe3JldHVybiBoci5kZWZhdWx0fX0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShicixcImdyaWRcIix7ZW51bWVyYWJsZTohMCxnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gZ3IuZGVmYXVsdH19KTt2YXIgeHI9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KHhyLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHhyLmRlZmF1bHQ9dm9pZCAwO3ZhciB3cj17aWQ6XCJzbmFwcGVyc1wiLGluc3RhbGw6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdFN0YXRpYztlLnNuYXBwZXJzPSgwLGouZGVmYXVsdCkoZS5zbmFwcGVyc3x8e30sYnIpLGUuY3JlYXRlU25hcEdyaWQ9ZS5zbmFwcGVycy5ncmlkfX07eHIuZGVmYXVsdD13cjt2YXIgX3I9e307ZnVuY3Rpb24gUHIodCxlKXt2YXIgbj1PYmplY3Qua2V5cyh0KTtpZihPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKXt2YXIgcj1PYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHQpO2UmJihyPXIuZmlsdGVyKChmdW5jdGlvbihlKXtyZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0LGUpLmVudW1lcmFibGV9KSkpLG4ucHVzaC5hcHBseShuLHIpfXJldHVybiBufWZ1bmN0aW9uIE9yKHQpe2Zvcih2YXIgZT0xO2U8YXJndW1lbnRzLmxlbmd0aDtlKyspe3ZhciBuPW51bGwhPWFyZ3VtZW50c1tlXT9hcmd1bWVudHNbZV06e307ZSUyP1ByKE9iamVjdChuKSwhMCkuZm9yRWFjaCgoZnVuY3Rpb24oZSl7U3IodCxlLG5bZV0pfSkpOk9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzP09iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHQsT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMobikpOlByKE9iamVjdChuKSkuZm9yRWFjaCgoZnVuY3Rpb24oZSl7T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsZSxPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG4sZSkpfSkpfXJldHVybiB0fWZ1bmN0aW9uIFNyKHQsZSxuKXtyZXR1cm4gZSBpbiB0P09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LGUse3ZhbHVlOm4sZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITB9KTp0W2VdPW4sdH1PYmplY3QuZGVmaW5lUHJvcGVydHkoX3IsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksX3IuYXNwZWN0UmF0aW89X3IuZGVmYXVsdD12b2lkIDA7dmFyIEVyPXtzdGFydDpmdW5jdGlvbih0KXt2YXIgZT10LnN0YXRlLG49dC5yZWN0LHI9dC5lZGdlcyxvPXQucGFnZUNvb3JkcyxpPWUub3B0aW9ucy5yYXRpbyxhPWUub3B0aW9ucyxzPWEuZXF1YWxEZWx0YSxsPWEubW9kaWZpZXJzO1wicHJlc2VydmVcIj09PWkmJihpPW4ud2lkdGgvbi5oZWlnaHQpLGUuc3RhcnRDb29yZHM9KDAsai5kZWZhdWx0KSh7fSxvKSxlLnN0YXJ0UmVjdD0oMCxqLmRlZmF1bHQpKHt9LG4pLGUucmF0aW89aSxlLmVxdWFsRGVsdGE9czt2YXIgdT1lLmxpbmtlZEVkZ2VzPXt0b3A6ci50b3B8fHIubGVmdCYmIXIuYm90dG9tLGxlZnQ6ci5sZWZ0fHxyLnRvcCYmIXIucmlnaHQsYm90dG9tOnIuYm90dG9tfHxyLnJpZ2h0JiYhci50b3AscmlnaHQ6ci5yaWdodHx8ci5ib3R0b20mJiFyLmxlZnR9O2lmKGUueElzUHJpbWFyeUF4aXM9ISghci5sZWZ0JiYhci5yaWdodCksZS5lcXVhbERlbHRhKWUuZWRnZVNpZ249KHUubGVmdD8xOi0xKSoodS50b3A/MTotMSk7ZWxzZXt2YXIgYz1lLnhJc1ByaW1hcnlBeGlzP3UudG9wOnUubGVmdDtlLmVkZ2VTaWduPWM/LTE6MX1pZigoMCxqLmRlZmF1bHQpKHQuZWRnZXMsdSksbCYmbC5sZW5ndGgpe3ZhciBmPW5ldyB5ZS5kZWZhdWx0KHQuaW50ZXJhY3Rpb24pO2YuY29weUZyb20odC5pbnRlcmFjdGlvbi5tb2RpZmljYXRpb24pLGYucHJlcGFyZVN0YXRlcyhsKSxlLnN1Yk1vZGlmaWNhdGlvbj1mLGYuc3RhcnRBbGwoT3Ioe30sdCkpfX0sc2V0OmZ1bmN0aW9uKHQpe3ZhciBlPXQuc3RhdGUsbj10LnJlY3Qscj10LmNvb3JkcyxvPSgwLGouZGVmYXVsdCkoe30sciksaT1lLmVxdWFsRGVsdGE/VHI6TXI7aWYoaShlLGUueElzUHJpbWFyeUF4aXMscixuKSwhZS5zdWJNb2RpZmljYXRpb24pcmV0dXJuIG51bGw7dmFyIGE9KDAsai5kZWZhdWx0KSh7fSxuKTsoMCxrLmFkZEVkZ2VzKShlLmxpbmtlZEVkZ2VzLGEse3g6ci54LW8ueCx5OnIueS1vLnl9KTt2YXIgcz1lLnN1Yk1vZGlmaWNhdGlvbi5zZXRBbGwoT3IoT3Ioe30sdCkse30se3JlY3Q6YSxlZGdlczplLmxpbmtlZEVkZ2VzLHBhZ2VDb29yZHM6cixwcmV2Q29vcmRzOnIscHJldlJlY3Q6YX0pKSxsPXMuZGVsdGE7cmV0dXJuIHMuY2hhbmdlZCYmKGkoZSxNYXRoLmFicyhsLngpPk1hdGguYWJzKGwueSkscy5jb29yZHMscy5yZWN0KSwoMCxqLmRlZmF1bHQpKHIscy5jb29yZHMpKSxzLmV2ZW50UHJvcHN9LGRlZmF1bHRzOntyYXRpbzpcInByZXNlcnZlXCIsZXF1YWxEZWx0YTohMSxtb2RpZmllcnM6W10sZW5hYmxlZDohMX19O2Z1bmN0aW9uIFRyKHQsZSxuKXt2YXIgcj10LnN0YXJ0Q29vcmRzLG89dC5lZGdlU2lnbjtlP24ueT1yLnkrKG4ueC1yLngpKm86bi54PXIueCsobi55LXIueSkqb31mdW5jdGlvbiBNcih0LGUsbixyKXt2YXIgbz10LnN0YXJ0UmVjdCxpPXQuc3RhcnRDb29yZHMsYT10LnJhdGlvLHM9dC5lZGdlU2lnbjtpZihlKXt2YXIgbD1yLndpZHRoL2E7bi55PWkueSsobC1vLmhlaWdodCkqc31lbHNle3ZhciB1PXIuaGVpZ2h0KmE7bi54PWkueCsodS1vLndpZHRoKSpzfX1fci5hc3BlY3RSYXRpbz1Fcjt2YXIganI9KDAsU2UubWFrZU1vZGlmaWVyKShFcixcImFzcGVjdFJhdGlvXCIpO19yLmRlZmF1bHQ9anI7dmFyIGtyPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShrcixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxrci5kZWZhdWx0PXZvaWQgMDt2YXIgSXI9ZnVuY3Rpb24oKXt9O0lyLl9kZWZhdWx0cz17fTt2YXIgRHI9SXI7a3IuZGVmYXVsdD1Ecjt2YXIgQXI9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KEFyLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBcixcImRlZmF1bHRcIix7ZW51bWVyYWJsZTohMCxnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4ga3IuZGVmYXVsdH19KTt2YXIgUnI9e307ZnVuY3Rpb24genIodCxlLG4pe3JldHVybiBpLmRlZmF1bHQuZnVuYyh0KT9rLnJlc29sdmVSZWN0TGlrZSh0LGUuaW50ZXJhY3RhYmxlLGUuZWxlbWVudCxbbi54LG4ueSxlXSk6ay5yZXNvbHZlUmVjdExpa2UodCxlLmludGVyYWN0YWJsZSxlLmVsZW1lbnQpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShScixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxSci5nZXRSZXN0cmljdGlvblJlY3Q9enIsUnIucmVzdHJpY3Q9UnIuZGVmYXVsdD12b2lkIDA7dmFyIENyPXtzdGFydDpmdW5jdGlvbih0KXt2YXIgZT10LnJlY3Qsbj10LnN0YXJ0T2Zmc2V0LHI9dC5zdGF0ZSxvPXQuaW50ZXJhY3Rpb24saT10LnBhZ2VDb29yZHMsYT1yLm9wdGlvbnMscz1hLmVsZW1lbnRSZWN0LGw9KDAsai5kZWZhdWx0KSh7bGVmdDowLHRvcDowLHJpZ2h0OjAsYm90dG9tOjB9LGEub2Zmc2V0fHx7fSk7aWYoZSYmcyl7dmFyIHU9enIoYS5yZXN0cmljdGlvbixvLGkpO2lmKHUpe3ZhciBjPXUucmlnaHQtdS5sZWZ0LWUud2lkdGgsZj11LmJvdHRvbS11LnRvcC1lLmhlaWdodDtjPDAmJihsLmxlZnQrPWMsbC5yaWdodCs9YyksZjwwJiYobC50b3ArPWYsbC5ib3R0b20rPWYpfWwubGVmdCs9bi5sZWZ0LWUud2lkdGgqcy5sZWZ0LGwudG9wKz1uLnRvcC1lLmhlaWdodCpzLnRvcCxsLnJpZ2h0Kz1uLnJpZ2h0LWUud2lkdGgqKDEtcy5yaWdodCksbC5ib3R0b20rPW4uYm90dG9tLWUuaGVpZ2h0KigxLXMuYm90dG9tKX1yLm9mZnNldD1sfSxzZXQ6ZnVuY3Rpb24odCl7dmFyIGU9dC5jb29yZHMsbj10LmludGVyYWN0aW9uLHI9dC5zdGF0ZSxvPXIub3B0aW9ucyxpPXIub2Zmc2V0LGE9enIoby5yZXN0cmljdGlvbixuLGUpO2lmKGEpe3ZhciBzPWsueHl3aFRvVGxicihhKTtlLng9TWF0aC5tYXgoTWF0aC5taW4ocy5yaWdodC1pLnJpZ2h0LGUueCkscy5sZWZ0K2kubGVmdCksZS55PU1hdGgubWF4KE1hdGgubWluKHMuYm90dG9tLWkuYm90dG9tLGUueSkscy50b3AraS50b3ApfX0sZGVmYXVsdHM6e3Jlc3RyaWN0aW9uOm51bGwsZWxlbWVudFJlY3Q6bnVsbCxvZmZzZXQ6bnVsbCxlbmRPbmx5OiExLGVuYWJsZWQ6ITF9fTtSci5yZXN0cmljdD1Dcjt2YXIgRnI9KDAsU2UubWFrZU1vZGlmaWVyKShDcixcInJlc3RyaWN0XCIpO1JyLmRlZmF1bHQ9RnI7dmFyIFhyPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShYcixcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxYci5yZXN0cmljdEVkZ2VzPVhyLmRlZmF1bHQ9dm9pZCAwO3ZhciBZcj17dG9wOjEvMCxsZWZ0OjEvMCxib3R0b206LTEvMCxyaWdodDotMS8wfSxCcj17dG9wOi0xLzAsbGVmdDotMS8wLGJvdHRvbToxLzAscmlnaHQ6MS8wfTtmdW5jdGlvbiBXcih0LGUpe2Zvcih2YXIgbj1bXCJ0b3BcIixcImxlZnRcIixcImJvdHRvbVwiLFwicmlnaHRcIl0scj0wO3I8bi5sZW5ndGg7cisrKXt2YXIgbz1uW3JdO28gaW4gdHx8KHRbb109ZVtvXSl9cmV0dXJuIHR9dmFyIExyPXtub0lubmVyOllyLG5vT3V0ZXI6QnIsc3RhcnQ6ZnVuY3Rpb24odCl7dmFyIGUsbj10LmludGVyYWN0aW9uLHI9dC5zdGFydE9mZnNldCxvPXQuc3RhdGUsaT1vLm9wdGlvbnM7aWYoaSl7dmFyIGE9KDAsUnIuZ2V0UmVzdHJpY3Rpb25SZWN0KShpLm9mZnNldCxuLG4uY29vcmRzLnN0YXJ0LnBhZ2UpO2U9ay5yZWN0VG9YWShhKX1lPWV8fHt4OjAseTowfSxvLm9mZnNldD17dG9wOmUueStyLnRvcCxsZWZ0OmUueCtyLmxlZnQsYm90dG9tOmUueS1yLmJvdHRvbSxyaWdodDplLngtci5yaWdodH19LHNldDpmdW5jdGlvbih0KXt2YXIgZT10LmNvb3JkcyxuPXQuZWRnZXMscj10LmludGVyYWN0aW9uLG89dC5zdGF0ZSxpPW8ub2Zmc2V0LGE9by5vcHRpb25zO2lmKG4pe3ZhciBzPSgwLGouZGVmYXVsdCkoe30sZSksbD0oMCxSci5nZXRSZXN0cmljdGlvblJlY3QpKGEuaW5uZXIscixzKXx8e30sdT0oMCxSci5nZXRSZXN0cmljdGlvblJlY3QpKGEub3V0ZXIscixzKXx8e307V3IobCxZciksV3IodSxCciksbi50b3A/ZS55PU1hdGgubWluKE1hdGgubWF4KHUudG9wK2kudG9wLHMueSksbC50b3AraS50b3ApOm4uYm90dG9tJiYoZS55PU1hdGgubWF4KE1hdGgubWluKHUuYm90dG9tK2kuYm90dG9tLHMueSksbC5ib3R0b20raS5ib3R0b20pKSxuLmxlZnQ/ZS54PU1hdGgubWluKE1hdGgubWF4KHUubGVmdCtpLmxlZnQscy54KSxsLmxlZnQraS5sZWZ0KTpuLnJpZ2h0JiYoZS54PU1hdGgubWF4KE1hdGgubWluKHUucmlnaHQraS5yaWdodCxzLngpLGwucmlnaHQraS5yaWdodCkpfX0sZGVmYXVsdHM6e2lubmVyOm51bGwsb3V0ZXI6bnVsbCxvZmZzZXQ6bnVsbCxlbmRPbmx5OiExLGVuYWJsZWQ6ITF9fTtYci5yZXN0cmljdEVkZ2VzPUxyO3ZhciBVcj0oMCxTZS5tYWtlTW9kaWZpZXIpKExyLFwicmVzdHJpY3RFZGdlc1wiKTtYci5kZWZhdWx0PVVyO3ZhciBWcj17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoVnIsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksVnIucmVzdHJpY3RSZWN0PVZyLmRlZmF1bHQ9dm9pZCAwO3ZhciBOcj0oMCxqLmRlZmF1bHQpKHtnZXQgZWxlbWVudFJlY3QoKXtyZXR1cm57dG9wOjAsbGVmdDowLGJvdHRvbToxLHJpZ2h0OjF9fSxzZXQgZWxlbWVudFJlY3QodCl7fX0sUnIucmVzdHJpY3QuZGVmYXVsdHMpLHFyPXtzdGFydDpSci5yZXN0cmljdC5zdGFydCxzZXQ6UnIucmVzdHJpY3Quc2V0LGRlZmF1bHRzOk5yfTtWci5yZXN0cmljdFJlY3Q9cXI7dmFyICRyPSgwLFNlLm1ha2VNb2RpZmllcikocXIsXCJyZXN0cmljdFJlY3RcIik7VnIuZGVmYXVsdD0kcjt2YXIgR3I9e307T2JqZWN0LmRlZmluZVByb3BlcnR5KEdyLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLEdyLnJlc3RyaWN0U2l6ZT1Hci5kZWZhdWx0PXZvaWQgMDt2YXIgSHI9e3dpZHRoOi0xLzAsaGVpZ2h0Oi0xLzB9LEtyPXt3aWR0aDoxLzAsaGVpZ2h0OjEvMH0sWnI9e3N0YXJ0OmZ1bmN0aW9uKHQpe3JldHVybiBYci5yZXN0cmljdEVkZ2VzLnN0YXJ0KHQpfSxzZXQ6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbixuPXQuc3RhdGUscj10LnJlY3Qsbz10LmVkZ2VzLGk9bi5vcHRpb25zO2lmKG8pe3ZhciBhPWsudGxiclRvWHl3aCgoMCxSci5nZXRSZXN0cmljdGlvblJlY3QpKGkubWluLGUsdC5jb29yZHMpKXx8SHIscz1rLnRsYnJUb1h5d2goKDAsUnIuZ2V0UmVzdHJpY3Rpb25SZWN0KShpLm1heCxlLHQuY29vcmRzKSl8fEtyO24ub3B0aW9ucz17ZW5kT25seTppLmVuZE9ubHksaW5uZXI6KDAsai5kZWZhdWx0KSh7fSxYci5yZXN0cmljdEVkZ2VzLm5vSW5uZXIpLG91dGVyOigwLGouZGVmYXVsdCkoe30sWHIucmVzdHJpY3RFZGdlcy5ub091dGVyKX0sby50b3A/KG4ub3B0aW9ucy5pbm5lci50b3A9ci5ib3R0b20tYS5oZWlnaHQsbi5vcHRpb25zLm91dGVyLnRvcD1yLmJvdHRvbS1zLmhlaWdodCk6by5ib3R0b20mJihuLm9wdGlvbnMuaW5uZXIuYm90dG9tPXIudG9wK2EuaGVpZ2h0LG4ub3B0aW9ucy5vdXRlci5ib3R0b209ci50b3Arcy5oZWlnaHQpLG8ubGVmdD8obi5vcHRpb25zLmlubmVyLmxlZnQ9ci5yaWdodC1hLndpZHRoLG4ub3B0aW9ucy5vdXRlci5sZWZ0PXIucmlnaHQtcy53aWR0aCk6by5yaWdodCYmKG4ub3B0aW9ucy5pbm5lci5yaWdodD1yLmxlZnQrYS53aWR0aCxuLm9wdGlvbnMub3V0ZXIucmlnaHQ9ci5sZWZ0K3Mud2lkdGgpLFhyLnJlc3RyaWN0RWRnZXMuc2V0KHQpLG4ub3B0aW9ucz1pfX0sZGVmYXVsdHM6e21pbjpudWxsLG1heDpudWxsLGVuZE9ubHk6ITEsZW5hYmxlZDohMX19O0dyLnJlc3RyaWN0U2l6ZT1acjt2YXIgSnI9KDAsU2UubWFrZU1vZGlmaWVyKShacixcInJlc3RyaWN0U2l6ZVwiKTtHci5kZWZhdWx0PUpyO3ZhciBRcj17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoUXIsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksT2JqZWN0LmRlZmluZVByb3BlcnR5KFFyLFwiZGVmYXVsdFwiLHtlbnVtZXJhYmxlOiEwLGdldDpmdW5jdGlvbigpe3JldHVybiBrci5kZWZhdWx0fX0pO3ZhciB0bz17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkodG8sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdG8uc25hcD10by5kZWZhdWx0PXZvaWQgMDt2YXIgZW89e3N0YXJ0OmZ1bmN0aW9uKHQpe3ZhciBlLG49dC5pbnRlcmFjdGlvbixyPXQuaW50ZXJhY3RhYmxlLG89dC5lbGVtZW50LGk9dC5yZWN0LGE9dC5zdGF0ZSxzPXQuc3RhcnRPZmZzZXQsbD1hLm9wdGlvbnMsdT1sLm9mZnNldFdpdGhPcmlnaW4/ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGlvbi5lbGVtZW50O3JldHVybigwLGsucmVjdFRvWFkpKCgwLGsucmVzb2x2ZVJlY3RMaWtlKSh0LnN0YXRlLm9wdGlvbnMub3JpZ2luLG51bGwsbnVsbCxbZV0pKXx8KDAsQS5kZWZhdWx0KSh0LmludGVyYWN0YWJsZSxlLHQuaW50ZXJhY3Rpb24ucHJlcGFyZWQubmFtZSl9KHQpOnt4OjAseTowfTtpZihcInN0YXJ0Q29vcmRzXCI9PT1sLm9mZnNldCllPXt4Om4uY29vcmRzLnN0YXJ0LnBhZ2UueCx5Om4uY29vcmRzLnN0YXJ0LnBhZ2UueX07ZWxzZXt2YXIgYz0oMCxrLnJlc29sdmVSZWN0TGlrZSkobC5vZmZzZXQscixvLFtuXSk7KGU9KDAsay5yZWN0VG9YWSkoYyl8fHt4OjAseTowfSkueCs9dS54LGUueSs9dS55fXZhciBmPWwucmVsYXRpdmVQb2ludHM7YS5vZmZzZXRzPWkmJmYmJmYubGVuZ3RoP2YubWFwKChmdW5jdGlvbih0LG4pe3JldHVybntpbmRleDpuLHJlbGF0aXZlUG9pbnQ6dCx4OnMubGVmdC1pLndpZHRoKnQueCtlLngseTpzLnRvcC1pLmhlaWdodCp0LnkrZS55fX0pKTpbe2luZGV4OjAscmVsYXRpdmVQb2ludDpudWxsLHg6ZS54LHk6ZS55fV19LHNldDpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uLG49dC5jb29yZHMscj10LnN0YXRlLG89ci5vcHRpb25zLGE9ci5vZmZzZXRzLHM9KDAsQS5kZWZhdWx0KShlLmludGVyYWN0YWJsZSxlLmVsZW1lbnQsZS5wcmVwYXJlZC5uYW1lKSxsPSgwLGouZGVmYXVsdCkoe30sbiksdT1bXTtvLm9mZnNldFdpdGhPcmlnaW58fChsLngtPXMueCxsLnktPXMueSk7Zm9yKHZhciBjPTA7YzxhLmxlbmd0aDtjKyspZm9yKHZhciBmPWFbY10sZD1sLngtZi54LHA9bC55LWYueSx2PTAsaD1vLnRhcmdldHMubGVuZ3RoO3Y8aDt2Kyspe3ZhciBnLHk9by50YXJnZXRzW3ZdOyhnPWkuZGVmYXVsdC5mdW5jKHkpP3koZCxwLGUuX3Byb3h5LGYsdik6eSkmJnUucHVzaCh7eDooaS5kZWZhdWx0Lm51bWJlcihnLngpP2cueDpkKStmLngseTooaS5kZWZhdWx0Lm51bWJlcihnLnkpP2cueTpwKStmLnkscmFuZ2U6aS5kZWZhdWx0Lm51bWJlcihnLnJhbmdlKT9nLnJhbmdlOm8ucmFuZ2Usc291cmNlOnksaW5kZXg6dixvZmZzZXQ6Zn0pfWZvcih2YXIgbT17dGFyZ2V0Om51bGwsaW5SYW5nZTohMSxkaXN0YW5jZTowLHJhbmdlOjAsZGVsdGE6e3g6MCx5OjB9fSxiPTA7Yjx1Lmxlbmd0aDtiKyspe3ZhciB4PXVbYl0sdz14LnJhbmdlLF89eC54LWwueCxQPXgueS1sLnksTz0oMCxDLmRlZmF1bHQpKF8sUCksUz1PPD13O3c9PT0xLzAmJm0uaW5SYW5nZSYmbS5yYW5nZSE9PTEvMCYmKFM9ITEpLG0udGFyZ2V0JiYhKFM/bS5pblJhbmdlJiZ3IT09MS8wP08vdzxtLmRpc3RhbmNlL20ucmFuZ2U6dz09PTEvMCYmbS5yYW5nZSE9PTEvMHx8TzxtLmRpc3RhbmNlOiFtLmluUmFuZ2UmJk88bS5kaXN0YW5jZSl8fChtLnRhcmdldD14LG0uZGlzdGFuY2U9TyxtLnJhbmdlPXcsbS5pblJhbmdlPVMsbS5kZWx0YS54PV8sbS5kZWx0YS55PVApfXJldHVybiBtLmluUmFuZ2UmJihuLng9bS50YXJnZXQueCxuLnk9bS50YXJnZXQueSksci5jbG9zZXN0PW0sbX0sZGVmYXVsdHM6e3JhbmdlOjEvMCx0YXJnZXRzOm51bGwsb2Zmc2V0Om51bGwsb2Zmc2V0V2l0aE9yaWdpbjohMCxvcmlnaW46bnVsbCxyZWxhdGl2ZVBvaW50czpudWxsLGVuZE9ubHk6ITEsZW5hYmxlZDohMX19O3RvLnNuYXA9ZW87dmFyIG5vPSgwLFNlLm1ha2VNb2RpZmllcikoZW8sXCJzbmFwXCIpO3RvLmRlZmF1bHQ9bm87dmFyIHJvPXt9O2Z1bmN0aW9uIG9vKHQsZSl7KG51bGw9PWV8fGU+dC5sZW5ndGgpJiYoZT10Lmxlbmd0aCk7Zm9yKHZhciBuPTAscj1BcnJheShlKTtuPGU7bisrKXJbbl09dFtuXTtyZXR1cm4gcn1PYmplY3QuZGVmaW5lUHJvcGVydHkocm8sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSkscm8uc25hcFNpemU9cm8uZGVmYXVsdD12b2lkIDA7dmFyIGlvPXtzdGFydDpmdW5jdGlvbih0KXt2YXIgZT10LnN0YXRlLG49dC5lZGdlcyxyPWUub3B0aW9ucztpZighbilyZXR1cm4gbnVsbDt0LnN0YXRlPXtvcHRpb25zOnt0YXJnZXRzOm51bGwscmVsYXRpdmVQb2ludHM6W3t4Om4ubGVmdD8wOjEseTpuLnRvcD8wOjF9XSxvZmZzZXQ6ci5vZmZzZXR8fFwic2VsZlwiLG9yaWdpbjp7eDowLHk6MH0scmFuZ2U6ci5yYW5nZX19LGUudGFyZ2V0RmllbGRzPWUudGFyZ2V0RmllbGRzfHxbW1wid2lkdGhcIixcImhlaWdodFwiXSxbXCJ4XCIsXCJ5XCJdXSx0by5zbmFwLnN0YXJ0KHQpLGUub2Zmc2V0cz10LnN0YXRlLm9mZnNldHMsdC5zdGF0ZT1lfSxzZXQ6ZnVuY3Rpb24odCl7dmFyIGUsbixyPXQuaW50ZXJhY3Rpb24sbz10LnN0YXRlLGE9dC5jb29yZHMscz1vLm9wdGlvbnMsbD1vLm9mZnNldHMsdT17eDphLngtbFswXS54LHk6YS55LWxbMF0ueX07by5vcHRpb25zPSgwLGouZGVmYXVsdCkoe30scyksby5vcHRpb25zLnRhcmdldHM9W107Zm9yKHZhciBjPTA7Yzwocy50YXJnZXRzfHxbXSkubGVuZ3RoO2MrKyl7dmFyIGY9KHMudGFyZ2V0c3x8W10pW2NdLGQ9dm9pZCAwO2lmKGQ9aS5kZWZhdWx0LmZ1bmMoZik/Zih1LngsdS55LHIpOmYpe2Zvcih2YXIgcD0wO3A8by50YXJnZXRGaWVsZHMubGVuZ3RoO3ArKyl7dmFyIHY9KGU9by50YXJnZXRGaWVsZHNbcF0sbj0yLGZ1bmN0aW9uKHQpe2lmKEFycmF5LmlzQXJyYXkodCkpcmV0dXJuIHR9KGUpfHxmdW5jdGlvbih0LGUpe2lmKFwidW5kZWZpbmVkXCIhPXR5cGVvZiBTeW1ib2wmJlN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QodCkpe3ZhciBuPVtdLHI9ITAsbz0hMSxpPXZvaWQgMDt0cnl7Zm9yKHZhciBhLHM9dFtTeW1ib2wuaXRlcmF0b3JdKCk7IShyPShhPXMubmV4dCgpKS5kb25lKSYmKG4ucHVzaChhLnZhbHVlKSwhZXx8bi5sZW5ndGghPT1lKTtyPSEwKTt9Y2F0Y2godCl7bz0hMCxpPXR9ZmluYWxseXt0cnl7cnx8bnVsbD09cy5yZXR1cm58fHMucmV0dXJuKCl9ZmluYWxseXtpZihvKXRocm93IGl9fXJldHVybiBufX0oZSxuKXx8ZnVuY3Rpb24odCxlKXtpZih0KXtpZihcInN0cmluZ1wiPT10eXBlb2YgdClyZXR1cm4gb28odCxlKTt2YXIgbj1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodCkuc2xpY2UoOCwtMSk7cmV0dXJuXCJPYmplY3RcIj09PW4mJnQuY29uc3RydWN0b3ImJihuPXQuY29uc3RydWN0b3IubmFtZSksXCJNYXBcIj09PW58fFwiU2V0XCI9PT1uP0FycmF5LmZyb20odCk6XCJBcmd1bWVudHNcIj09PW58fC9eKD86VWl8SSludCg/Ojh8MTZ8MzIpKD86Q2xhbXBlZCk/QXJyYXkkLy50ZXN0KG4pP29vKHQsZSk6dm9pZCAwfX0oZSxuKXx8ZnVuY3Rpb24oKXt0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZS5cXG5JbiBvcmRlciB0byBiZSBpdGVyYWJsZSwgbm9uLWFycmF5IG9iamVjdHMgbXVzdCBoYXZlIGEgW1N5bWJvbC5pdGVyYXRvcl0oKSBtZXRob2QuXCIpfSgpKSxoPXZbMF0sZz12WzFdO2lmKGggaW4gZHx8ZyBpbiBkKXtkLng9ZFtoXSxkLnk9ZFtnXTticmVha319by5vcHRpb25zLnRhcmdldHMucHVzaChkKX19dmFyIHk9dG8uc25hcC5zZXQodCk7cmV0dXJuIG8ub3B0aW9ucz1zLHl9LGRlZmF1bHRzOntyYW5nZToxLzAsdGFyZ2V0czpudWxsLG9mZnNldDpudWxsLGVuZE9ubHk6ITEsZW5hYmxlZDohMX19O3JvLnNuYXBTaXplPWlvO3ZhciBhbz0oMCxTZS5tYWtlTW9kaWZpZXIpKGlvLFwic25hcFNpemVcIik7cm8uZGVmYXVsdD1hbzt2YXIgc289e307T2JqZWN0LmRlZmluZVByb3BlcnR5KHNvLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHNvLnNuYXBFZGdlcz1zby5kZWZhdWx0PXZvaWQgMDt2YXIgbG89e3N0YXJ0OmZ1bmN0aW9uKHQpe3ZhciBlPXQuZWRnZXM7cmV0dXJuIGU/KHQuc3RhdGUudGFyZ2V0RmllbGRzPXQuc3RhdGUudGFyZ2V0RmllbGRzfHxbW2UubGVmdD9cImxlZnRcIjpcInJpZ2h0XCIsZS50b3A/XCJ0b3BcIjpcImJvdHRvbVwiXV0scm8uc25hcFNpemUuc3RhcnQodCkpOm51bGx9LHNldDpyby5zbmFwU2l6ZS5zZXQsZGVmYXVsdHM6KDAsai5kZWZhdWx0KSgoMCxnZS5kZWZhdWx0KShyby5zbmFwU2l6ZS5kZWZhdWx0cykse3RhcmdldHM6bnVsbCxyYW5nZTpudWxsLG9mZnNldDp7eDowLHk6MH19KX07c28uc25hcEVkZ2VzPWxvO3ZhciB1bz0oMCxTZS5tYWtlTW9kaWZpZXIpKGxvLFwic25hcEVkZ2VzXCIpO3NvLmRlZmF1bHQ9dW87dmFyIGNvPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShjbyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoY28sXCJkZWZhdWx0XCIse2VudW1lcmFibGU6ITAsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIGtyLmRlZmF1bHR9fSk7dmFyIGZvPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShmbyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoZm8sXCJkZWZhdWx0XCIse2VudW1lcmFibGU6ITAsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIGtyLmRlZmF1bHR9fSk7dmFyIHBvPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShwbyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxwby5kZWZhdWx0PXZvaWQgMDt2YXIgdm89e2FzcGVjdFJhdGlvOl9yLmRlZmF1bHQscmVzdHJpY3RFZGdlczpYci5kZWZhdWx0LHJlc3RyaWN0OlJyLmRlZmF1bHQscmVzdHJpY3RSZWN0OlZyLmRlZmF1bHQscmVzdHJpY3RTaXplOkdyLmRlZmF1bHQsc25hcEVkZ2VzOnNvLmRlZmF1bHQsc25hcDp0by5kZWZhdWx0LHNuYXBTaXplOnJvLmRlZmF1bHQsc3ByaW5nOmNvLmRlZmF1bHQsYXZvaWQ6QXIuZGVmYXVsdCx0cmFuc2Zvcm06Zm8uZGVmYXVsdCxydWJiZXJiYW5kOlFyLmRlZmF1bHR9O3BvLmRlZmF1bHQ9dm87dmFyIGhvPXt9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShobyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxoby5kZWZhdWx0PXZvaWQgMDt2YXIgZ289e2lkOlwibW9kaWZpZXJzXCIsaW5zdGFsbDpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0U3RhdGljO2Zvcih2YXIgbiBpbiB0LnVzZVBsdWdpbihTZS5kZWZhdWx0KSx0LnVzZVBsdWdpbih4ci5kZWZhdWx0KSxlLm1vZGlmaWVycz1wby5kZWZhdWx0LHBvLmRlZmF1bHQpe3ZhciByPXBvLmRlZmF1bHRbbl0sbz1yLl9kZWZhdWx0cyxpPXIuX21ldGhvZHM7by5fbWV0aG9kcz1pLHQuZGVmYXVsdHMucGVyQWN0aW9uW25dPW99fX07aG8uZGVmYXVsdD1nbzt2YXIgeW89e307ZnVuY3Rpb24gbW8odCl7cmV0dXJuKG1vPVwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmXCJzeW1ib2xcIj09dHlwZW9mIFN5bWJvbC5pdGVyYXRvcj9mdW5jdGlvbih0KXtyZXR1cm4gdHlwZW9mIHR9OmZ1bmN0aW9uKHQpe3JldHVybiB0JiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJnQuY29uc3RydWN0b3I9PT1TeW1ib2wmJnQhPT1TeW1ib2wucHJvdG90eXBlP1wic3ltYm9sXCI6dHlwZW9mIHR9KSh0KX1mdW5jdGlvbiBibyh0LGUpe2Zvcih2YXIgbj0wO248ZS5sZW5ndGg7bisrKXt2YXIgcj1lW25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkodCxyLmtleSxyKX19ZnVuY3Rpb24geG8odCxlKXtyZXR1cm4oeG89T2JqZWN0LnNldFByb3RvdHlwZU9mfHxmdW5jdGlvbih0LGUpe3JldHVybiB0Ll9fcHJvdG9fXz1lLHR9KSh0LGUpfWZ1bmN0aW9uIHdvKHQsZSl7cmV0dXJuIWV8fFwib2JqZWN0XCIhPT1tbyhlKSYmXCJmdW5jdGlvblwiIT10eXBlb2YgZT9fbyh0KTplfWZ1bmN0aW9uIF9vKHQpe2lmKHZvaWQgMD09PXQpdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO3JldHVybiB0fWZ1bmN0aW9uIFBvKHQpe3JldHVybihQbz1PYmplY3Quc2V0UHJvdG90eXBlT2Y/T2JqZWN0LmdldFByb3RvdHlwZU9mOmZ1bmN0aW9uKHQpe3JldHVybiB0Ll9fcHJvdG9fX3x8T2JqZWN0LmdldFByb3RvdHlwZU9mKHQpfSkodCl9ZnVuY3Rpb24gT28odCxlLG4pe3JldHVybiBlIGluIHQ/T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsZSx7dmFsdWU6bixlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMH0pOnRbZV09bix0fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh5byxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx5by5Qb2ludGVyRXZlbnQ9eW8uZGVmYXVsdD12b2lkIDA7dmFyIFNvPWZ1bmN0aW9uKHQpeyFmdW5jdGlvbih0LGUpe2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIGUmJm51bGwhPT1lKXRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvblwiKTt0LnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUmJmUucHJvdG90eXBlLHtjb25zdHJ1Y3Rvcjp7dmFsdWU6dCx3cml0YWJsZTohMCxjb25maWd1cmFibGU6ITB9fSksZSYmeG8odCxlKX0oYSx0KTt2YXIgZSxuLHIsbyxpPShyPWEsbz1mdW5jdGlvbigpe2lmKFwidW5kZWZpbmVkXCI9PXR5cGVvZiBSZWZsZWN0fHwhUmVmbGVjdC5jb25zdHJ1Y3QpcmV0dXJuITE7aWYoUmVmbGVjdC5jb25zdHJ1Y3Quc2hhbSlyZXR1cm4hMTtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBQcm94eSlyZXR1cm4hMDt0cnl7cmV0dXJuIEJvb2xlYW4ucHJvdG90eXBlLnZhbHVlT2YuY2FsbChSZWZsZWN0LmNvbnN0cnVjdChCb29sZWFuLFtdLChmdW5jdGlvbigpe30pKSksITB9Y2F0Y2godCl7cmV0dXJuITF9fSgpLGZ1bmN0aW9uKCl7dmFyIHQsZT1QbyhyKTtpZihvKXt2YXIgbj1Qbyh0aGlzKS5jb25zdHJ1Y3Rvcjt0PVJlZmxlY3QuY29uc3RydWN0KGUsYXJndW1lbnRzLG4pfWVsc2UgdD1lLmFwcGx5KHRoaXMsYXJndW1lbnRzKTtyZXR1cm4gd28odGhpcyx0KX0pO2Z1bmN0aW9uIGEodCxlLG4scixvLHMpe3ZhciBsO2lmKGZ1bmN0aW9uKHQsZSl7aWYoISh0IGluc3RhbmNlb2YgZSkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX0odGhpcyxhKSxPbyhfbyhsPWkuY2FsbCh0aGlzLG8pKSxcInR5cGVcIix2b2lkIDApLE9vKF9vKGwpLFwib3JpZ2luYWxFdmVudFwiLHZvaWQgMCksT28oX28obCksXCJwb2ludGVySWRcIix2b2lkIDApLE9vKF9vKGwpLFwicG9pbnRlclR5cGVcIix2b2lkIDApLE9vKF9vKGwpLFwiZG91YmxlXCIsdm9pZCAwKSxPbyhfbyhsKSxcInBhZ2VYXCIsdm9pZCAwKSxPbyhfbyhsKSxcInBhZ2VZXCIsdm9pZCAwKSxPbyhfbyhsKSxcImNsaWVudFhcIix2b2lkIDApLE9vKF9vKGwpLFwiY2xpZW50WVwiLHZvaWQgMCksT28oX28obCksXCJkdFwiLHZvaWQgMCksT28oX28obCksXCJldmVudGFibGVcIix2b2lkIDApLEIucG9pbnRlckV4dGVuZChfbyhsKSxuKSxuIT09ZSYmQi5wb2ludGVyRXh0ZW5kKF9vKGwpLGUpLGwudGltZVN0YW1wPXMsbC5vcmlnaW5hbEV2ZW50PW4sbC50eXBlPXQsbC5wb2ludGVySWQ9Qi5nZXRQb2ludGVySWQoZSksbC5wb2ludGVyVHlwZT1CLmdldFBvaW50ZXJUeXBlKGUpLGwudGFyZ2V0PXIsbC5jdXJyZW50VGFyZ2V0PW51bGwsXCJ0YXBcIj09PXQpe3ZhciB1PW8uZ2V0UG9pbnRlckluZGV4KGUpO2wuZHQ9bC50aW1lU3RhbXAtby5wb2ludGVyc1t1XS5kb3duVGltZTt2YXIgYz1sLnRpbWVTdGFtcC1vLnRhcFRpbWU7bC5kb3VibGU9ISEoby5wcmV2VGFwJiZcImRvdWJsZXRhcFwiIT09by5wcmV2VGFwLnR5cGUmJm8ucHJldlRhcC50YXJnZXQ9PT1sLnRhcmdldCYmYzw1MDApfWVsc2VcImRvdWJsZXRhcFwiPT09dCYmKGwuZHQ9ZS50aW1lU3RhbXAtby50YXBUaW1lKTtyZXR1cm4gbH1yZXR1cm4gZT1hLChuPVt7a2V5OlwiX3N1YnRyYWN0T3JpZ2luXCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dC54LG49dC55O3JldHVybiB0aGlzLnBhZ2VYLT1lLHRoaXMucGFnZVktPW4sdGhpcy5jbGllbnRYLT1lLHRoaXMuY2xpZW50WS09bix0aGlzfX0se2tleTpcIl9hZGRPcmlnaW5cIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10Lngsbj10Lnk7cmV0dXJuIHRoaXMucGFnZVgrPWUsdGhpcy5wYWdlWSs9bix0aGlzLmNsaWVudFgrPWUsdGhpcy5jbGllbnRZKz1uLHRoaXN9fSx7a2V5OlwicHJldmVudERlZmF1bHRcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMub3JpZ2luYWxFdmVudC5wcmV2ZW50RGVmYXVsdCgpfX1dKSYmYm8oZS5wcm90b3R5cGUsbiksYX0oJC5CYXNlRXZlbnQpO3lvLlBvaW50ZXJFdmVudD15by5kZWZhdWx0PVNvO3ZhciBFbz17fTtPYmplY3QuZGVmaW5lUHJvcGVydHkoRW8sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksRW8uZGVmYXVsdD12b2lkIDA7dmFyIFRvPXtpZDpcInBvaW50ZXItZXZlbnRzL2Jhc2VcIixiZWZvcmU6W1wiaW5lcnRpYVwiLFwibW9kaWZpZXJzXCIsXCJhdXRvLXN0YXJ0XCIsXCJhY3Rpb25zXCJdLGluc3RhbGw6ZnVuY3Rpb24odCl7dC5wb2ludGVyRXZlbnRzPVRvLHQuZGVmYXVsdHMuYWN0aW9ucy5wb2ludGVyRXZlbnRzPVRvLmRlZmF1bHRzLCgwLGouZGVmYXVsdCkodC5hY3Rpb25zLnBoYXNlbGVzc1R5cGVzLFRvLnR5cGVzKX0sbGlzdGVuZXJzOntcImludGVyYWN0aW9uczpuZXdcIjpmdW5jdGlvbih0KXt2YXIgZT10LmludGVyYWN0aW9uO2UucHJldlRhcD1udWxsLGUudGFwVGltZT0wfSxcImludGVyYWN0aW9uczp1cGRhdGUtcG9pbnRlclwiOmZ1bmN0aW9uKHQpe3ZhciBlPXQuZG93bixuPXQucG9pbnRlckluZm87IWUmJm4uaG9sZHx8KG4uaG9sZD17ZHVyYXRpb246MS8wLHRpbWVvdXQ6bnVsbH0pfSxcImludGVyYWN0aW9uczptb3ZlXCI6ZnVuY3Rpb24odCxlKXt2YXIgbj10LmludGVyYWN0aW9uLHI9dC5wb2ludGVyLG89dC5ldmVudCxpPXQuZXZlbnRUYXJnZXQ7dC5kdXBsaWNhdGV8fG4ucG9pbnRlcklzRG93biYmIW4ucG9pbnRlcldhc01vdmVkfHwobi5wb2ludGVySXNEb3duJiZrbyh0KSxNbyh7aW50ZXJhY3Rpb246bixwb2ludGVyOnIsZXZlbnQ6byxldmVudFRhcmdldDppLHR5cGU6XCJtb3ZlXCJ9LGUpKX0sXCJpbnRlcmFjdGlvbnM6ZG93blwiOmZ1bmN0aW9uKHQsZSl7IWZ1bmN0aW9uKHQsZSl7Zm9yKHZhciBuPXQuaW50ZXJhY3Rpb24scj10LnBvaW50ZXIsbz10LmV2ZW50LGk9dC5ldmVudFRhcmdldCxhPXQucG9pbnRlckluZGV4LHM9bi5wb2ludGVyc1thXS5ob2xkLGw9Xy5nZXRQYXRoKGkpLHU9e2ludGVyYWN0aW9uOm4scG9pbnRlcjpyLGV2ZW50Om8sZXZlbnRUYXJnZXQ6aSx0eXBlOlwiaG9sZFwiLHRhcmdldHM6W10scGF0aDpsLG5vZGU6bnVsbH0sYz0wO2M8bC5sZW5ndGg7YysrKXt2YXIgZj1sW2NdO3Uubm9kZT1mLGUuZmlyZShcInBvaW50ZXJFdmVudHM6Y29sbGVjdC10YXJnZXRzXCIsdSl9aWYodS50YXJnZXRzLmxlbmd0aCl7Zm9yKHZhciBkPTEvMCxwPTA7cDx1LnRhcmdldHMubGVuZ3RoO3ArKyl7dmFyIHY9dS50YXJnZXRzW3BdLmV2ZW50YWJsZS5vcHRpb25zLmhvbGREdXJhdGlvbjt2PGQmJihkPXYpfXMuZHVyYXRpb249ZCxzLnRpbWVvdXQ9c2V0VGltZW91dCgoZnVuY3Rpb24oKXtNbyh7aW50ZXJhY3Rpb246bixldmVudFRhcmdldDppLHBvaW50ZXI6cixldmVudDpvLHR5cGU6XCJob2xkXCJ9LGUpfSksZCl9fSh0LGUpLE1vKHQsZSl9LFwiaW50ZXJhY3Rpb25zOnVwXCI6ZnVuY3Rpb24odCxlKXtrbyh0KSxNbyh0LGUpLGZ1bmN0aW9uKHQsZSl7dmFyIG49dC5pbnRlcmFjdGlvbixyPXQucG9pbnRlcixvPXQuZXZlbnQsaT10LmV2ZW50VGFyZ2V0O24ucG9pbnRlcldhc01vdmVkfHxNbyh7aW50ZXJhY3Rpb246bixldmVudFRhcmdldDppLHBvaW50ZXI6cixldmVudDpvLHR5cGU6XCJ0YXBcIn0sZSl9KHQsZSl9LFwiaW50ZXJhY3Rpb25zOmNhbmNlbFwiOmZ1bmN0aW9uKHQsZSl7a28odCksTW8odCxlKX19LFBvaW50ZXJFdmVudDp5by5Qb2ludGVyRXZlbnQsZmlyZTpNbyxjb2xsZWN0RXZlbnRUYXJnZXRzOmpvLGRlZmF1bHRzOntob2xkRHVyYXRpb246NjAwLGlnbm9yZUZyb206bnVsbCxhbGxvd0Zyb206bnVsbCxvcmlnaW46e3g6MCx5OjB9fSx0eXBlczp7ZG93bjohMCxtb3ZlOiEwLHVwOiEwLGNhbmNlbDohMCx0YXA6ITAsZG91YmxldGFwOiEwLGhvbGQ6ITB9fTtmdW5jdGlvbiBNbyh0LGUpe3ZhciBuPXQuaW50ZXJhY3Rpb24scj10LnBvaW50ZXIsbz10LmV2ZW50LGk9dC5ldmVudFRhcmdldCxhPXQudHlwZSxzPXQudGFyZ2V0cyxsPXZvaWQgMD09PXM/am8odCxlKTpzLHU9bmV3IHlvLlBvaW50ZXJFdmVudChhLHIsbyxpLG4sZS5ub3coKSk7ZS5maXJlKFwicG9pbnRlckV2ZW50czpuZXdcIix7cG9pbnRlckV2ZW50OnV9KTtmb3IodmFyIGM9e2ludGVyYWN0aW9uOm4scG9pbnRlcjpyLGV2ZW50Om8sZXZlbnRUYXJnZXQ6aSx0YXJnZXRzOmwsdHlwZTphLHBvaW50ZXJFdmVudDp1fSxmPTA7ZjxsLmxlbmd0aDtmKyspe3ZhciBkPWxbZl07Zm9yKHZhciBwIGluIGQucHJvcHN8fHt9KXVbcF09ZC5wcm9wc1twXTt2YXIgdj0oMCxBLmRlZmF1bHQpKGQuZXZlbnRhYmxlLGQubm9kZSk7aWYodS5fc3VidHJhY3RPcmlnaW4odiksdS5ldmVudGFibGU9ZC5ldmVudGFibGUsdS5jdXJyZW50VGFyZ2V0PWQubm9kZSxkLmV2ZW50YWJsZS5maXJlKHUpLHUuX2FkZE9yaWdpbih2KSx1LmltbWVkaWF0ZVByb3BhZ2F0aW9uU3RvcHBlZHx8dS5wcm9wYWdhdGlvblN0b3BwZWQmJmYrMTxsLmxlbmd0aCYmbFtmKzFdLm5vZGUhPT11LmN1cnJlbnRUYXJnZXQpYnJlYWt9aWYoZS5maXJlKFwicG9pbnRlckV2ZW50czpmaXJlZFwiLGMpLFwidGFwXCI9PT1hKXt2YXIgaD11LmRvdWJsZT9Nbyh7aW50ZXJhY3Rpb246bixwb2ludGVyOnIsZXZlbnQ6byxldmVudFRhcmdldDppLHR5cGU6XCJkb3VibGV0YXBcIn0sZSk6dTtuLnByZXZUYXA9aCxuLnRhcFRpbWU9aC50aW1lU3RhbXB9cmV0dXJuIHV9ZnVuY3Rpb24gam8odCxlKXt2YXIgbj10LmludGVyYWN0aW9uLHI9dC5wb2ludGVyLG89dC5ldmVudCxpPXQuZXZlbnRUYXJnZXQsYT10LnR5cGUscz1uLmdldFBvaW50ZXJJbmRleChyKSxsPW4ucG9pbnRlcnNbc107aWYoXCJ0YXBcIj09PWEmJihuLnBvaW50ZXJXYXNNb3ZlZHx8IWx8fGwuZG93blRhcmdldCE9PWkpKXJldHVybltdO2Zvcih2YXIgdT1fLmdldFBhdGgoaSksYz17aW50ZXJhY3Rpb246bixwb2ludGVyOnIsZXZlbnQ6byxldmVudFRhcmdldDppLHR5cGU6YSxwYXRoOnUsdGFyZ2V0czpbXSxub2RlOm51bGx9LGY9MDtmPHUubGVuZ3RoO2YrKyl7dmFyIGQ9dVtmXTtjLm5vZGU9ZCxlLmZpcmUoXCJwb2ludGVyRXZlbnRzOmNvbGxlY3QtdGFyZ2V0c1wiLGMpfXJldHVyblwiaG9sZFwiPT09YSYmKGMudGFyZ2V0cz1jLnRhcmdldHMuZmlsdGVyKChmdW5jdGlvbih0KXt2YXIgZTtyZXR1cm4gdC5ldmVudGFibGUub3B0aW9ucy5ob2xkRHVyYXRpb249PT0obnVsbD09KGU9bi5wb2ludGVyc1tzXSk/dm9pZCAwOmUuaG9sZC5kdXJhdGlvbil9KSkpLGMudGFyZ2V0c31mdW5jdGlvbiBrbyh0KXt2YXIgZT10LmludGVyYWN0aW9uLG49dC5wb2ludGVySW5kZXgscj1lLnBvaW50ZXJzW25dLmhvbGQ7ciYmci50aW1lb3V0JiYoY2xlYXJUaW1lb3V0KHIudGltZW91dCksci50aW1lb3V0PW51bGwpfXZhciBJbz1UbztFby5kZWZhdWx0PUlvO3ZhciBEbz17fTtmdW5jdGlvbiBBbyh0KXt2YXIgZT10LmludGVyYWN0aW9uO2UuaG9sZEludGVydmFsSGFuZGxlJiYoY2xlYXJJbnRlcnZhbChlLmhvbGRJbnRlcnZhbEhhbmRsZSksZS5ob2xkSW50ZXJ2YWxIYW5kbGU9bnVsbCl9T2JqZWN0LmRlZmluZVByb3BlcnR5KERvLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLERvLmRlZmF1bHQ9dm9pZCAwO3ZhciBSbz17aWQ6XCJwb2ludGVyLWV2ZW50cy9ob2xkUmVwZWF0XCIsaW5zdGFsbDpmdW5jdGlvbih0KXt0LnVzZVBsdWdpbihFby5kZWZhdWx0KTt2YXIgZT10LnBvaW50ZXJFdmVudHM7ZS5kZWZhdWx0cy5ob2xkUmVwZWF0SW50ZXJ2YWw9MCxlLnR5cGVzLmhvbGRyZXBlYXQ9dC5hY3Rpb25zLnBoYXNlbGVzc1R5cGVzLmhvbGRyZXBlYXQ9ITB9LGxpc3RlbmVyczpbXCJtb3ZlXCIsXCJ1cFwiLFwiY2FuY2VsXCIsXCJlbmRhbGxcIl0ucmVkdWNlKChmdW5jdGlvbih0LGUpe3JldHVybiB0W1wicG9pbnRlckV2ZW50czpcIi5jb25jYXQoZSldPUFvLHR9KSx7XCJwb2ludGVyRXZlbnRzOm5ld1wiOmZ1bmN0aW9uKHQpe3ZhciBlPXQucG9pbnRlckV2ZW50O1wiaG9sZFwiPT09ZS50eXBlJiYoZS5jb3VudD0oZS5jb3VudHx8MCkrMSl9LFwicG9pbnRlckV2ZW50czpmaXJlZFwiOmZ1bmN0aW9uKHQsZSl7dmFyIG49dC5pbnRlcmFjdGlvbixyPXQucG9pbnRlckV2ZW50LG89dC5ldmVudFRhcmdldCxpPXQudGFyZ2V0cztpZihcImhvbGRcIj09PXIudHlwZSYmaS5sZW5ndGgpe3ZhciBhPWlbMF0uZXZlbnRhYmxlLm9wdGlvbnMuaG9sZFJlcGVhdEludGVydmFsO2E8PTB8fChuLmhvbGRJbnRlcnZhbEhhbmRsZT1zZXRUaW1lb3V0KChmdW5jdGlvbigpe2UucG9pbnRlckV2ZW50cy5maXJlKHtpbnRlcmFjdGlvbjpuLGV2ZW50VGFyZ2V0Om8sdHlwZTpcImhvbGRcIixwb2ludGVyOnIsZXZlbnQ6cn0sZSl9KSxhKSl9fX0pfTtEby5kZWZhdWx0PVJvO3ZhciB6bz17fTtmdW5jdGlvbiBDbyh0KXtyZXR1cm4oMCxqLmRlZmF1bHQpKHRoaXMuZXZlbnRzLm9wdGlvbnMsdCksdGhpc31PYmplY3QuZGVmaW5lUHJvcGVydHkoem8sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksem8uZGVmYXVsdD12b2lkIDA7dmFyIEZvPXtpZDpcInBvaW50ZXItZXZlbnRzL2ludGVyYWN0YWJsZVRhcmdldHNcIixpbnN0YWxsOmZ1bmN0aW9uKHQpe3ZhciBlPXQuSW50ZXJhY3RhYmxlO2UucHJvdG90eXBlLnBvaW50ZXJFdmVudHM9Q287dmFyIG49ZS5wcm90b3R5cGUuX2JhY2tDb21wYXRPcHRpb247ZS5wcm90b3R5cGUuX2JhY2tDb21wYXRPcHRpb249ZnVuY3Rpb24odCxlKXt2YXIgcj1uLmNhbGwodGhpcyx0LGUpO3JldHVybiByPT09dGhpcyYmKHRoaXMuZXZlbnRzLm9wdGlvbnNbdF09ZSkscn19LGxpc3RlbmVyczp7XCJwb2ludGVyRXZlbnRzOmNvbGxlY3QtdGFyZ2V0c1wiOmZ1bmN0aW9uKHQsZSl7dmFyIG49dC50YXJnZXRzLHI9dC5ub2RlLG89dC50eXBlLGk9dC5ldmVudFRhcmdldDtlLmludGVyYWN0YWJsZXMuZm9yRWFjaE1hdGNoKHIsKGZ1bmN0aW9uKHQpe3ZhciBlPXQuZXZlbnRzLGE9ZS5vcHRpb25zO2UudHlwZXNbb10mJmUudHlwZXNbb10ubGVuZ3RoJiZ0LnRlc3RJZ25vcmVBbGxvdyhhLHIsaSkmJm4ucHVzaCh7bm9kZTpyLGV2ZW50YWJsZTplLHByb3BzOntpbnRlcmFjdGFibGU6dH19KX0pKX0sXCJpbnRlcmFjdGFibGU6bmV3XCI6ZnVuY3Rpb24odCl7dmFyIGU9dC5pbnRlcmFjdGFibGU7ZS5ldmVudHMuZ2V0UmVjdD1mdW5jdGlvbih0KXtyZXR1cm4gZS5nZXRSZWN0KHQpfX0sXCJpbnRlcmFjdGFibGU6c2V0XCI6ZnVuY3Rpb24odCxlKXt2YXIgbj10LmludGVyYWN0YWJsZSxyPXQub3B0aW9uczsoMCxqLmRlZmF1bHQpKG4uZXZlbnRzLm9wdGlvbnMsZS5wb2ludGVyRXZlbnRzLmRlZmF1bHRzKSwoMCxqLmRlZmF1bHQpKG4uZXZlbnRzLm9wdGlvbnMsci5wb2ludGVyRXZlbnRzfHx7fSl9fX07em8uZGVmYXVsdD1Gbzt2YXIgWG89e307T2JqZWN0LmRlZmluZVByb3BlcnR5KFhvLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLFhvLmRlZmF1bHQ9dm9pZCAwO3ZhciBZbz17aWQ6XCJwb2ludGVyLWV2ZW50c1wiLGluc3RhbGw6ZnVuY3Rpb24odCl7dC51c2VQbHVnaW4oRW8pLHQudXNlUGx1Z2luKERvLmRlZmF1bHQpLHQudXNlUGx1Z2luKHpvLmRlZmF1bHQpfX07WG8uZGVmYXVsdD1Zbzt2YXIgQm89e307ZnVuY3Rpb24gV28odCl7dmFyIGU9dC5JbnRlcmFjdGFibGU7dC5hY3Rpb25zLnBoYXNlcy5yZWZsb3c9ITAsZS5wcm90b3R5cGUucmVmbG93PWZ1bmN0aW9uKGUpe3JldHVybiBmdW5jdGlvbih0LGUsbil7Zm9yKHZhciByPWkuZGVmYXVsdC5zdHJpbmcodC50YXJnZXQpP1ouZnJvbSh0Ll9jb250ZXh0LnF1ZXJ5U2VsZWN0b3JBbGwodC50YXJnZXQpKTpbdC50YXJnZXRdLG89bi53aW5kb3cuUHJvbWlzZSxhPW8/W106bnVsbCxzPWZ1bmN0aW9uKCl7dmFyIGk9cltsXSxzPXQuZ2V0UmVjdChpKTtpZighcylyZXR1cm5cImJyZWFrXCI7dmFyIHU9Wi5maW5kKG4uaW50ZXJhY3Rpb25zLmxpc3QsKGZ1bmN0aW9uKG4pe3JldHVybiBuLmludGVyYWN0aW5nKCkmJm4uaW50ZXJhY3RhYmxlPT09dCYmbi5lbGVtZW50PT09aSYmbi5wcmVwYXJlZC5uYW1lPT09ZS5uYW1lfSkpLGM9dm9pZCAwO2lmKHUpdS5tb3ZlKCksYSYmKGM9dS5fcmVmbG93UHJvbWlzZXx8bmV3IG8oKGZ1bmN0aW9uKHQpe3UuX3JlZmxvd1Jlc29sdmU9dH0pKSk7ZWxzZXt2YXIgZj0oMCxrLnRsYnJUb1h5d2gpKHMpLGQ9e3BhZ2U6e3g6Zi54LHk6Zi55fSxjbGllbnQ6e3g6Zi54LHk6Zi55fSx0aW1lU3RhbXA6bi5ub3coKX0scD1CLmNvb3Jkc1RvRXZlbnQoZCk7Yz1mdW5jdGlvbih0LGUsbixyLG8pe3ZhciBpPXQuaW50ZXJhY3Rpb25zLm5ldyh7cG9pbnRlclR5cGU6XCJyZWZsb3dcIn0pLGE9e2ludGVyYWN0aW9uOmksZXZlbnQ6byxwb2ludGVyOm8sZXZlbnRUYXJnZXQ6bixwaGFzZTpcInJlZmxvd1wifTtpLmludGVyYWN0YWJsZT1lLGkuZWxlbWVudD1uLGkucHJldkV2ZW50PW8saS51cGRhdGVQb2ludGVyKG8sbyxuLCEwKSxCLnNldFplcm9Db29yZHMoaS5jb29yZHMuZGVsdGEpLCgwLFl0LmNvcHlBY3Rpb24pKGkucHJlcGFyZWQsciksaS5fZG9QaGFzZShhKTt2YXIgcz10LndpbmRvdy5Qcm9taXNlLGw9cz9uZXcgcygoZnVuY3Rpb24odCl7aS5fcmVmbG93UmVzb2x2ZT10fSkpOnZvaWQgMDtyZXR1cm4gaS5fcmVmbG93UHJvbWlzZT1sLGkuc3RhcnQocixlLG4pLGkuX2ludGVyYWN0aW5nPyhpLm1vdmUoYSksaS5lbmQobykpOihpLnN0b3AoKSxpLl9yZWZsb3dSZXNvbHZlKCkpLGkucmVtb3ZlUG9pbnRlcihvLG8pLGx9KG4sdCxpLGUscCl9YSYmYS5wdXNoKGMpfSxsPTA7bDxyLmxlbmd0aCYmXCJicmVha1wiIT09cygpO2wrKyk7cmV0dXJuIGEmJm8uYWxsKGEpLnRoZW4oKGZ1bmN0aW9uKCl7cmV0dXJuIHR9KSl9KHRoaXMsZSx0KX19T2JqZWN0LmRlZmluZVByb3BlcnR5KEJvLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLEJvLmluc3RhbGw9V28sQm8uZGVmYXVsdD12b2lkIDA7dmFyIExvPXtpZDpcInJlZmxvd1wiLGluc3RhbGw6V28sbGlzdGVuZXJzOntcImludGVyYWN0aW9uczpzdG9wXCI6ZnVuY3Rpb24odCxlKXt2YXIgbj10LmludGVyYWN0aW9uO1wicmVmbG93XCI9PT1uLnBvaW50ZXJUeXBlJiYobi5fcmVmbG93UmVzb2x2ZSYmbi5fcmVmbG93UmVzb2x2ZSgpLFoucmVtb3ZlKGUuaW50ZXJhY3Rpb25zLmxpc3QsbikpfX19O0JvLmRlZmF1bHQ9TG87dmFyIFVvPXtleHBvcnRzOnt9fTtmdW5jdGlvbiBWbyh0KXtyZXR1cm4oVm89XCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZcInN5bWJvbFwiPT10eXBlb2YgU3ltYm9sLml0ZXJhdG9yP2Z1bmN0aW9uKHQpe3JldHVybiB0eXBlb2YgdH06ZnVuY3Rpb24odCl7cmV0dXJuIHQmJlwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmdC5jb25zdHJ1Y3Rvcj09PVN5bWJvbCYmdCE9PVN5bWJvbC5wcm90b3R5cGU/XCJzeW1ib2xcIjp0eXBlb2YgdH0pKHQpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShVby5leHBvcnRzLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLFVvLmV4cG9ydHMuZGVmYXVsdD12b2lkIDAsY3IuZGVmYXVsdC51c2Uoc2UuZGVmYXVsdCksY3IuZGVmYXVsdC51c2UoR2UuZGVmYXVsdCksY3IuZGVmYXVsdC51c2UoWG8uZGVmYXVsdCksY3IuZGVmYXVsdC51c2UoZW4uZGVmYXVsdCksY3IuZGVmYXVsdC51c2UoaG8uZGVmYXVsdCksY3IuZGVmYXVsdC51c2UoaWUuZGVmYXVsdCksY3IuZGVmYXVsdC51c2UoVHQuZGVmYXVsdCksY3IuZGVmYXVsdC51c2UoUnQuZGVmYXVsdCksY3IuZGVmYXVsdC51c2UoQm8uZGVmYXVsdCk7dmFyIE5vPWNyLmRlZmF1bHQ7aWYoVW8uZXhwb3J0cy5kZWZhdWx0PU5vLFwib2JqZWN0XCI9PT1WbyhVbykmJlVvKXRyeXtVby5leHBvcnRzPWNyLmRlZmF1bHR9Y2F0Y2godCl7fWNyLmRlZmF1bHQuZGVmYXVsdD1jci5kZWZhdWx0LFVvPVVvLmV4cG9ydHM7dmFyIHFvPXtleHBvcnRzOnt9fTtmdW5jdGlvbiAkbyh0KXtyZXR1cm4oJG89XCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZcInN5bWJvbFwiPT10eXBlb2YgU3ltYm9sLml0ZXJhdG9yP2Z1bmN0aW9uKHQpe3JldHVybiB0eXBlb2YgdH06ZnVuY3Rpb24odCl7cmV0dXJuIHQmJlwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmdC5jb25zdHJ1Y3Rvcj09PVN5bWJvbCYmdCE9PVN5bWJvbC5wcm90b3R5cGU/XCJzeW1ib2xcIjp0eXBlb2YgdH0pKHQpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShxby5leHBvcnRzLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHFvLmV4cG9ydHMuZGVmYXVsdD12b2lkIDA7dmFyIEdvPVVvLmRlZmF1bHQ7aWYocW8uZXhwb3J0cy5kZWZhdWx0PUdvLFwib2JqZWN0XCI9PT0kbyhxbykmJnFvKXRyeXtxby5leHBvcnRzPVVvLmRlZmF1bHR9Y2F0Y2godCl7fXJldHVybiBVby5kZWZhdWx0LmRlZmF1bHQ9VW8uZGVmYXVsdCxxby5leHBvcnRzfSkpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW50ZXJhY3QubWluLmpzLm1hcFxuIiwiaW1wb3J0IHsgY29uZmlnIH0gZnJvbSAnLi4vY29uZmlnJ1xyXG5cclxuY2xhc3MgU2VsZWN0YWJsZVRhYkVscyB7XHJcbiAgYnRuOiBFbGVtZW50O1xyXG4gIGJvcmRlckNvdmVyOiBFbGVtZW50O1xyXG4gIGNvbnN0cnVjdG9yIChidG46IEVsZW1lbnQsIGJvcmRlckNvdmVyOiBFbGVtZW50KSB7XHJcbiAgICB0aGlzLmJ0biA9IGJ0blxyXG4gICAgdGhpcy5ib3JkZXJDb3ZlciA9IGJvcmRlckNvdmVyXHJcbiAgfVxyXG5cclxuICB1bnNlbGVjdEVscyAoKSB7XHJcbiAgICB0aGlzLmJ0bi5jbGFzc0xpc3QucmVtb3ZlKGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZClcclxuICAgIHRoaXMuYm9yZGVyQ292ZXIuY2xhc3NMaXN0LnJlbW92ZShjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgfVxyXG5cclxuICBzZWxlY3RFbHMgKCkge1xyXG4gICAgdGhpcy5idG4uY2xhc3NMaXN0LmFkZChjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICB0aGlzLmJvcmRlckNvdmVyLmNsYXNzTGlzdC5hZGQoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gIH1cclxuXHJcbiAgc2VsZWN0TmV3VGFiIChidG46IEVsZW1lbnQsIGJvcmRlckNvdmVyOiBFbGVtZW50KSB7XHJcbiAgICAvLyB1bnNlbGVjdCB0aGUgcHJldmlvdXMgdGFiXHJcbiAgICB0aGlzLnVuc2VsZWN0RWxzKClcclxuXHJcbiAgICAvLyByZWFzc2lnbiB0aGUgbmV3IHRhYiBlbGVtZW50c1xyXG4gICAgdGhpcy5idG4gPSBidG5cclxuICAgIHRoaXMuYm9yZGVyQ292ZXIgPSBib3JkZXJDb3ZlclxyXG5cclxuICAgIC8vIHNlbGVjdCB0aGUgbmV3IHRhYlxyXG4gICAgdGhpcy5zZWxlY3RFbHMoKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgU2VsZWN0YWJsZVRhYkVsc1xyXG4iLCJjbGFzcyBBbGJ1bSB7XHJcbiAgbmFtZTogc3RyaW5nO1xyXG4gIGV4dGVybmFsVXJsOiBzdHJpbmc7XHJcbiAgY29uc3RydWN0b3IgKG5hbWU6IHN0cmluZywgZXh0ZXJuYWxVcmw6IHN0cmluZykge1xyXG4gICAgdGhpcy5uYW1lID0gbmFtZVxyXG4gICAgdGhpcy5leHRlcm5hbFVybCA9IGV4dGVybmFsVXJsXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBbGJ1bVxyXG4iLCJpbXBvcnQgeyBjb25maWcsIGh0bWxUb0VsLCBnZXRWYWxpZEltYWdlIH0gZnJvbSAnLi4vY29uZmlnJ1xyXG5pbXBvcnQgVHJhY2ssIHsgZ2VuZXJhdGVUcmFja3NGcm9tRGF0YSB9IGZyb20gJy4vdHJhY2snXHJcbmltcG9ydCBDYXJkIGZyb20gJy4vY2FyZCdcclxuaW1wb3J0IERvdWJseUxpbmtlZExpc3QgZnJvbSAnLi9kb3VibHktbGlua2VkLWxpc3QnXHJcbmltcG9ydCB7IEFydGlzdERhdGEsIFNwb3RpZnlJbWcgfSBmcm9tICcuLi90eXBlcydcclxuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJ1xyXG5cclxuY2xhc3MgQXJ0aXN0IGV4dGVuZHMgQ2FyZCB7XHJcbiAgYXJ0aXN0SWQ6IHN0cmluZztcclxuICBuYW1lOiBzdHJpbmc7XHJcbiAgZ2VucmVzOiBBcnJheTxzdHJpbmc+O1xyXG4gIGZvbGxvd2VyQ291bnQ6IHN0cmluZztcclxuICBleHRlcm5hbFVybDogc3RyaW5nO1xyXG4gIGltYWdlVXJsOiBzdHJpbmc7XHJcbiAgdG9wVHJhY2tzOiBEb3VibHlMaW5rZWRMaXN0PFRyYWNrPiB8IHVuZGVmaW5lZDtcclxuXHJcbiAgY29uc3RydWN0b3IgKGlkOiBzdHJpbmcsIG5hbWU6IHN0cmluZywgZ2VucmVzOiBBcnJheTxzdHJpbmc+LCBmb2xsb3dlckNvdW50OiBzdHJpbmcsIGV4dGVybmFsVXJsOiBzdHJpbmcsIGltYWdlczogQXJyYXk8U3BvdGlmeUltZz4pIHtcclxuICAgIHN1cGVyKClcclxuICAgIHRoaXMuYXJ0aXN0SWQgPSBpZFxyXG4gICAgdGhpcy5uYW1lID0gbmFtZVxyXG4gICAgdGhpcy5nZW5yZXMgPSBnZW5yZXNcclxuICAgIHRoaXMuZm9sbG93ZXJDb3VudCA9IGZvbGxvd2VyQ291bnRcclxuICAgIHRoaXMuZXh0ZXJuYWxVcmwgPSBleHRlcm5hbFVybFxyXG4gICAgdGhpcy5pbWFnZVVybCA9IGdldFZhbGlkSW1hZ2UoaW1hZ2VzKVxyXG4gICAgdGhpcy50b3BUcmFja3MgPSB1bmRlZmluZWRcclxuICB9XHJcblxyXG4gIC8qKiBQcm9kdWNlcyB0aGUgY2FyZCBlbGVtZW50IG9mIHRoaXMgYXJ0aXN0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGlkeCAtIFRoZSBjYXJkIGluZGV4IHRvIHVzZSBmb3IgdGhlIGVsZW1lbnRzIGlkIHN1ZmZpeFxyXG4gICAqIEByZXR1cm5zIHtDaGlsZE5vZGV9IC0gVGhlIGNvbnZlcnRlZCBodG1sIHN0cmluZyB0byBhbiBlbGVtZW50XHJcbiAgICovXHJcbiAgZ2V0QXJ0aXN0SHRtbCAoaWR4OiBudW1iZXIpIHtcclxuICAgIGNvbnN0IGlkID0gYCR7Y29uZmlnLkNTUy5JRHMuYXJ0aXN0UHJlZml4fSR7aWR4fWBcclxuXHJcbiAgICB0aGlzLmNhcmRJZCA9IGlkXHJcbiAgICBsZXQgZ2VucmVMaXN0ID0gJydcclxuICAgIHRoaXMuZ2VucmVzLmZvckVhY2goKGdlbnJlKSA9PiB7XHJcbiAgICAgIGdlbnJlTGlzdCArPSAnPGxpPicgKyBnZW5yZSArICc8L2xpPidcclxuICAgIH0pXHJcblxyXG4gICAgY29uc3QgaHRtbCA9IGBcclxuICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmFydGlzdH0gJHtjb25maWcuQ1NTLkNMQVNTRVMuZmFkZUlufVwiIGlkPVwiJHt0aGlzLmNhcmRJZH1cIj5cclxuICAgICAgICA8c2VjdGlvbiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmNvbnRlbnR9XCI+XHJcbiAgICAgICAgICA8aGVhZGVyIGNsYXNzPVwiYXJ0aXN0LWJhc2VcIj5cclxuICAgICAgICAgICAgPGltZyBzcmM9JHt0aGlzLmltYWdlVXJsfSBhbHQ9XCJBcnRpc3RcIi8+XHJcbiAgICAgICAgICAgIDxoMz4ke3RoaXMubmFtZX08L2gzPlxyXG4gICAgICAgICAgICA8dWwgY2xhc3M9XCJnZW5yZXNcIj5cclxuICAgICAgICAgICAgICAke2dlbnJlTGlzdH1cclxuICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgIDwvaGVhZGVyPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnRyYWNrc0FyZWF9XCI+XHJcbiAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuYXJ0aXN0VG9wVHJhY2tzfVwiPlxyXG4gICAgICAgICAgICAgIDxoZWFkZXI+XHJcbiAgICAgICAgICAgICAgICA8aDQ+VG9wIFRyYWNrczwvaDQ+XHJcbiAgICAgICAgICAgICAgPC9oZWFkZXI+XHJcbiAgICAgICAgICAgICAgPHVsIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuc2Nyb2xsQmFyfSAke2NvbmZpZy5DU1MuQ0xBU1NFUy50cmFja0xpc3R9XCI+XHJcbiAgICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgICAgPC9zZWN0aW9uPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9zZWN0aW9uPlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgYFxyXG4gICAgcmV0dXJuIGh0bWxUb0VsKGh0bWwpXHJcbiAgfVxyXG5cclxuICAvKiogUHJvZHVjZXMgdGhlIGNhcmQgZWxlbWVudCBvZiB0aGlzIGFydGlzdC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpZHggLSBUaGUgY2FyZCBpbmRleCB0byB1c2UgZm9yIHRoZSBlbGVtZW50cyBpZCBzdWZmaXhcclxuICAgKiBAcmV0dXJucyB7Q2hpbGROb2RlfSAtIFRoZSBjb252ZXJ0ZWQgaHRtbCBzdHJpbmcgdG8gYW4gZWxlbWVudFxyXG4gICAqL1xyXG4gIGdldEFydGlzdENhcmRIdG1sIChpZHg6IG51bWJlciwgdW5hbmltYXRlZEFwcGVhciA9IGZhbHNlKTogTm9kZSB7XHJcbiAgICBjb25zdCBpZCA9IGAke2NvbmZpZy5DU1MuSURzLmFydGlzdFByZWZpeH0ke2lkeH1gXHJcbiAgICB0aGlzLmNhcmRJZCA9IGlkXHJcbiAgICBjb25zdCBhcHBlYXJDbGFzcyA9IHVuYW5pbWF0ZWRBcHBlYXIgPyBjb25maWcuQ1NTLkNMQVNTRVMuYXBwZWFyIDogJydcclxuICAgIGNvbnN0IGh0bWwgPSBgXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5yYW5rQ2FyZH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLmZhZGVJblxyXG4gICAgfSAke2FwcGVhckNsYXNzfVwiPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5mbGlwQ2FyZH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLm5vU2VsZWN0XHJcbiAgICB9ICAke2NvbmZpZy5DU1MuQ0xBU1NFUy5leHBhbmRPbkhvdmVyfVwiPlxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmNhcmR9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5mbGlwQ2FyZElubmVyXHJcbiAgICB9ICR7Y29uZmlnLkNTUy5DTEFTU0VTLmFydGlzdH1cIiBpZD1cIiR7dGhpcy5nZXRDYXJkSWQoKX1cIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLmZsaXBDYXJkRnJvbnRcclxuICAgICAgICAgICAgICAgICAgfVwiICB0aXRsZT1cIkNsaWNrIHRvIHZpZXcgbW9yZSBJbmZvXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9XCIke3RoaXMuaW1hZ2VVcmx9XCIgYWx0PVwiQWxidW0gQ292ZXJcIj48L2ltZz5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGg0IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMuc2Nyb2xsaW5nVGV4dFxyXG4gICAgfVwiPiR7dGhpcy5uYW1lfTwvaDQ+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSR7Y29uZmlnLkNTUy5DTEFTU0VTLmZsaXBDYXJkQmFja30+XHJcbiAgICAgICAgICAgICAgICAgICAgPGgzPkZvbGxvd2Vyczo8L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgIDxwPiR7dGhpcy5mb2xsb3dlckNvdW50fTwvcD5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICBgXHJcbiAgICByZXR1cm4gaHRtbFRvRWwoaHRtbCkgYXMgTm9kZVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgbG9hZFRvcFRyYWNrcyAoKSB7XHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBheGlvcy5nZXQoY29uZmlnLlVSTHMuZ2V0QXJ0aXN0VG9wVHJhY2tzKHRoaXMuYXJ0aXN0SWQpKVxyXG4gICAgY29uc3QgdHJhY2tzRGF0YSA9IHJlcy5kYXRhLnRyYWNrc1xyXG4gICAgY29uc3QgdHJhY2tPYmpzID0gbmV3IERvdWJseUxpbmtlZExpc3Q8VHJhY2s+KClcclxuXHJcbiAgICBnZW5lcmF0ZVRyYWNrc0Zyb21EYXRhKHRyYWNrc0RhdGEsIHRyYWNrT2JqcylcclxuXHJcbiAgICB0aGlzLnRvcFRyYWNrcyA9IHRyYWNrT2Jqc1xyXG4gICAgcmV0dXJuIHRyYWNrT2Jqc1xyXG4gIH1cclxuXHJcbiAgaGFzTG9hZGVkVG9wVHJhY2tzICgpIHtcclxuICAgIHJldHVybiB0aGlzLnRvcFRyYWNrcyAhPT0gdW5kZWZpbmVkXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVBcnRpc3RzRnJvbURhdGEgKGRhdGFzOiBBcnJheTxBcnRpc3REYXRhPiwgYXJ0aXN0QXJyOiBBcnJheTxBcnRpc3Q+KSB7XHJcbiAgZGF0YXMuZm9yRWFjaCgoZGF0YTogQXJ0aXN0RGF0YSkgPT4ge1xyXG4gICAgYXJ0aXN0QXJyLnB1c2goXHJcbiAgICAgIG5ldyBBcnRpc3QoXHJcbiAgICAgICAgZGF0YS5pZCxcclxuICAgICAgICBkYXRhLm5hbWUsXHJcbiAgICAgICAgZGF0YS5nZW5yZXMsXHJcbiAgICAgICAgZGF0YS5mb2xsb3dlcnMudG90YWwsXHJcbiAgICAgICAgZGF0YS5leHRlcm5hbF91cmxzLnNwb3RpZnksXHJcbiAgICAgICAgZGF0YS5pbWFnZXNcclxuICAgICAgKVxyXG4gICAgKVxyXG4gIH0pXHJcbiAgcmV0dXJuIGFydGlzdEFyclxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBcnRpc3RcclxuIiwiY2xhc3MgQXN5bmNTZWxlY3Rpb25WZXJpZjxUPiB7XHJcbiAgcHJpdmF0ZSBfY3VyclNlbGVjdGVkVmFsOiBUIHwgbnVsbDtcclxuICBoYXNMb2FkZWRDdXJyU2VsZWN0ZWQ6IGJvb2xlYW47XHJcblxyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIHRoaXMuX2N1cnJTZWxlY3RlZFZhbCA9IG51bGxcclxuXHJcbiAgICAvLyB1c2VkIHRvIGVuc3VyZSB0aGF0IGFuIG9iamVjdCB0aGF0IGhhcyBsb2FkZWQgd2lsbCBub3QgYmUgbG9hZGVkIGFnYWluXHJcbiAgICB0aGlzLmhhc0xvYWRlZEN1cnJTZWxlY3RlZCA9IGZhbHNlXHJcbiAgfVxyXG5cclxuICBnZXQgY3VyclNlbGVjdGVkVmFsTm9OdWxsICgpOiBUIHtcclxuICAgIGlmICghdGhpcy5fY3VyclNlbGVjdGVkVmFsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ3VycmVudGx5IHNlbGVjdGVkIHZhbHVlIGlzIGFjY2Vzc2VkIHdpdGhvdXQgYmVpbmcgYXNzaWduZWQnKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX2N1cnJTZWxlY3RlZFZhbFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZ2V0IGN1cnJTZWxlY3RlZFZhbCAoKTogVCB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuX2N1cnJTZWxlY3RlZFZhbFxyXG4gIH1cclxuXHJcbiAgLyogQ2hhbmdlIHRoZSB2YWx1ZSBvZiB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGFuZCByZXNldCB0aGUgaGFzIGxvYWRlZCBib29sZWFuLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBbnl9IC0gZGF0YSB0aGF0IGhhcyBiZWVuIHNlbGVjdGVkXHJcbiAgICovXHJcbiAgc2VsZWN0aW9uQ2hhbmdlZCAoY3VyclNlbGVjdGVkVmFsOiBUKSB7XHJcbiAgICB0aGlzLl9jdXJyU2VsZWN0ZWRWYWwgPSBjdXJyU2VsZWN0ZWRWYWxcclxuICAgIHRoaXMuaGFzTG9hZGVkQ3VyclNlbGVjdGVkID0gZmFsc2VcclxuICB9XHJcblxyXG4gIC8qKiBDaGVja3MgdG8gc2VlIGlmIGEgc2VsZWN0ZWQgdmFsdWUgcG9zdCBsb2FkIGlzIHZhbGlkIGJ5XHJcbiAgICogY29tcGFyaW5nIGl0IHRvIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgdmFsdWUgYW5kIHZlcmlmeWluZyB0aGF0XHJcbiAgICogdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBoYXMgbm90IGFscmVhZHkgYmVlbiBsb2FkZWQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1R9IC0gZGF0YSB0aGF0IGhhcyBiZWVuIGxvYWRlZFxyXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSAtIHdoZXRoZXIgdGhlIGxvYWRlZCBzZWxlY3Rpb24gaXMgdmFsaWRcclxuICAgKi9cclxuICBpc1ZhbGlkIChwb3N0TG9hZFZhbDogVCk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKHRoaXMuX2N1cnJTZWxlY3RlZFZhbCAhPT0gcG9zdExvYWRWYWwgfHwgdGhpcy5oYXNMb2FkZWRDdXJyU2VsZWN0ZWQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBpZiBpcyB2YWxpZCB0aGVuIHdlIGFzc3VtZSB0aGF0IHRoaXMgdmFsdWUgd2lsbCBiZSBsb2FkZWRcclxuICAgICAgdGhpcy5oYXNMb2FkZWRDdXJyU2VsZWN0ZWQgPSB0cnVlXHJcbiAgICAgIHJldHVybiB0cnVlXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBc3luY1NlbGVjdGlvblZlcmlmXHJcbiIsImNsYXNzIENhcmQge1xyXG4gIGNhcmRJZDogc3RyaW5nO1xyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIHRoaXMuY2FyZElkID0gJydcclxuICB9XHJcblxyXG4gIGdldENhcmRJZCAoKSB7XHJcbiAgICBpZiAodGhpcy5jYXJkSWQgPT09ICdudWxsJykge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhcmQgaWQgd2FzIGFza2luZyB0byBiZSByZXRyaWV2ZWQgYnV0IGlzIG51bGwnKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuY2FyZElkXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDYXJkXHJcbiIsIi8qIENvcHlyaWdodCAoYykgMjAwOSBOaWNob2xhcyBDLiBaYWthcy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gKi9cclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRzIGEgc2luZ2xlIG5vZGUgaW4gYSBEb3VibHlMaW5rZWRMaXN0LlxyXG4gKiBAY2xhc3MgRG91Ymx5TGlua2VkTGlzdE5vZGVcclxuICovXHJcbmV4cG9ydCBjbGFzcyBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB7XHJcbiAgZGF0YTogVDtcclxuICBuZXh0OiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPiB8IG51bGxcclxuICBwcmV2aW91czogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBudWxsXHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgRG91Ymx5TGlua2VkTGlzdE5vZGUuXHJcbiAgICogQHBhcmFtIHsqfSBkYXRhIFRoZSBkYXRhIHRvIHN0b3JlIGluIHRoZSBub2RlLlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yIChkYXRhOiBUKSB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkYXRhIHRoYXQgdGhpcyBub2RlIHN0b3Jlcy5cclxuICAgICAqIEBwcm9wZXJ0eSBkYXRhXHJcbiAgICAgKiBAdHlwZSAqXHJcbiAgICAgKi9cclxuICAgIHRoaXMuZGF0YSA9IGRhdGFcclxuXHJcbiAgICAvKipcclxuICAgICAqIEEgcG9pbnRlciB0byB0aGUgbmV4dCBub2RlIGluIHRoZSBEb3VibHlMaW5rZWRMaXN0LlxyXG4gICAgICogQHByb3BlcnR5IG5leHRcclxuICAgICAqIEB0eXBlID9Eb3VibHlMaW5rZWRMaXN0Tm9kZVxyXG4gICAgICovXHJcbiAgICB0aGlzLm5leHQgPSBudWxsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBIHBvaW50ZXIgdG8gdGhlIHByZXZpb3VzIG5vZGUgaW4gdGhlIERvdWJseUxpbmtlZExpc3QuXHJcbiAgICAgKiBAcHJvcGVydHkgcHJldmlvdXNcclxuICAgICAqIEB0eXBlID9Eb3VibHlMaW5rZWRMaXN0Tm9kZVxyXG4gICAgICovXHJcbiAgICB0aGlzLnByZXZpb3VzID0gbnVsbFxyXG4gIH1cclxufVxyXG4vKipcclxuICogQSBkb3VibHkgbGlua2VkIGxpc3QgaW1wbGVtZW50YXRpb24gaW4gSmF2YVNjcmlwdC5cclxuICogQGNsYXNzIERvdWJseUxpbmtlZExpc3RcclxuICovXHJcbmNsYXNzIERvdWJseUxpbmtlZExpc3Q8VD4ge1xyXG4gIGhlYWQ6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgbnVsbFxyXG4gIHRhaWw6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgbnVsbFxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgRG91Ymx5TGlua2VkTGlzdFxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIC8vIHBvaW50ZXIgdG8gZmlyc3Qgbm9kZSBpbiB0aGUgbGlzdFxyXG4gICAgdGhpcy5oZWFkID0gbnVsbFxyXG5cclxuICAgIC8vIHBvaW50ZXIgdG8gbGFzdCBub2RlIGluIHRoZSBsaXN0IHdoaWNoIHBvaW50cyB0byBudWxsXHJcbiAgICB0aGlzLnRhaWwgPSBudWxsXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHBlbmRzIHNvbWUgZGF0YSB0byB0aGUgZW5kIG9mIHRoZSBsaXN0LlxyXG4gICAqIEBwYXJhbSB7VH0gZGF0YSBUaGUgZGF0YSB0byBhZGQgdG8gdGhlIGxpc3QuXHJcbiAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICovXHJcbiAgYWRkIChkYXRhOiBUKTogdm9pZCB7XHJcbiAgICAvKlxyXG4gICAgICogQ3JlYXRlIGEgbmV3IGxpc3Qgbm9kZSBvYmplY3QgYW5kIHN0b3JlIHRoZSBkYXRhIGluIGl0LlxyXG4gICAgICogVGhpcyBub2RlIHdpbGwgYmUgYWRkZWQgdG8gdGhlIGVuZCBvZiB0aGUgZXhpc3RpbmcgbGlzdC5cclxuICAgICAqL1xyXG4gICAgY29uc3QgbmV3Tm9kZSA9IG5ldyBEb3VibHlMaW5rZWRMaXN0Tm9kZTxUPihkYXRhKVxyXG5cclxuICAgIC8vIHNwZWNpYWwgY2FzZTogbm8gbm9kZXMgaW4gdGhlIGxpc3QgeWV0XHJcbiAgICBpZiAodGhpcy5oZWFkID09PSBudWxsKSB7XHJcbiAgICAgIC8qXHJcbiAgICAgICAqIEJlY2F1c2UgdGhlcmUgYXJlIG5vIG5vZGVzIGluIHRoZSBsaXN0LCBqdXN0IHNldCB0aGVcclxuICAgICAgICogYHRoaXMuaGVhZGAgcG9pbnRlciB0byB0aGUgbmV3IG5vZGUuXHJcbiAgICAgICAqL1xyXG4gICAgICB0aGlzLmhlYWQgPSBuZXdOb2RlXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvKlxyXG4gICAgICAgKiBVbmxpa2UgaW4gYSBzaW5nbHkgbGlua2VkIGxpc3QsIHdlIGhhdmUgYSBkaXJlY3QgcmVmZXJlbmNlIHRvXHJcbiAgICAgICAqIHRoZSBsYXN0IG5vZGUgaW4gdGhlIGxpc3QuIFNldCB0aGUgYG5leHRgIHBvaW50ZXIgb2YgdGhlXHJcbiAgICAgICAqIGN1cnJlbnQgbGFzdCBub2RlIHRvIGBuZXdOb2RlYCBpbiBvcmRlciB0byBhcHBlbmQgdGhlIG5ldyBkYXRhXHJcbiAgICAgICAqIHRvIHRoZSBlbmQgb2YgdGhlIGxpc3QuIFRoZW4sIHNldCBgbmV3Tm9kZS5wcmV2aW91c2AgdG8gdGhlIGN1cnJlbnRcclxuICAgICAgICogdGFpbCB0byBlbnN1cmUgYmFja3dhcmRzIHRyYWNraW5nIHdvcmsuXHJcbiAgICAgICAqL1xyXG4gICAgICBpZiAodGhpcy50YWlsICE9PSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy50YWlsLm5leHQgPSBuZXdOb2RlXHJcbiAgICAgIH1cclxuICAgICAgbmV3Tm9kZS5wcmV2aW91cyA9IHRoaXMudGFpbFxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBMYXN0LCByZXNldCBgdGhpcy50YWlsYCB0byBgbmV3Tm9kZWAgdG8gZW5zdXJlIHdlIGFyZSBzdGlsbFxyXG4gICAgICogdHJhY2tpbmcgdGhlIGxhc3Qgbm9kZSBjb3JyZWN0bHkuXHJcbiAgICAgKi9cclxuICAgIHRoaXMudGFpbCA9IG5ld05vZGVcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEluc2VydHMgc29tZSBkYXRhIGludG8gdGhlIG1pZGRsZSBvZiB0aGUgbGlzdC4gVGhpcyBtZXRob2QgdHJhdmVyc2VzXHJcbiAgICogdGhlIGV4aXN0aW5nIGxpc3QgYW5kIHBsYWNlcyB0aGUgZGF0YSBpbiBhIG5ldyBub2RlIGF0IGEgc3BlY2lmaWMgaW5kZXguXHJcbiAgICogQHBhcmFtIHtUfSBkYXRhIFRoZSBkYXRhIHRvIGFkZCB0byB0aGUgbGlzdC5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggVGhlIHplcm8tYmFzZWQgaW5kZXggYXQgd2hpY2ggdG8gaW5zZXJ0IHRoZSBkYXRhLlxyXG4gICAqIEByZXR1cm5zIHt2b2lkfVxyXG4gICAqIEB0aHJvd3Mge1JhbmdlRXJyb3J9IElmIHRoZSBpbmRleCBkb2Vzbid0IGV4aXN0IGluIHRoZSBsaXN0LlxyXG4gICAqL1xyXG4gIGluc2VydEJlZm9yZSAoZGF0YTogVCwgaW5kZXg6IG51bWJlcik6IHZvaWQge1xyXG4gICAgLypcclxuICAgICAqIENyZWF0ZSBhIG5ldyBsaXN0IG5vZGUgb2JqZWN0IGFuZCBzdG9yZSB0aGUgZGF0YSBpbiBpdC5cclxuICAgICAqIFRoaXMgbm9kZSB3aWxsIGJlIGluc2VydGVkIGludG8gdGhlIGV4aXN0aW5nIGxpc3QuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IG5ld05vZGUgPSBuZXcgRG91Ymx5TGlua2VkTGlzdE5vZGUoZGF0YSlcclxuXHJcbiAgICAvLyBzcGVjaWFsIGNhc2U6IG5vIG5vZGVzIGluIHRoZSBsaXN0IHlldFxyXG4gICAgaWYgKHRoaXMuaGVhZCA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgSW5kZXggJHtpbmRleH0gZG9lcyBub3QgZXhpc3QgaW4gdGhlIGxpc3QuYClcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogU3BlY2lhbCBjYXNlOiBpZiBgaW5kZXhgIGlzIGAwYCwgdGhlbiBubyB0cmF2ZXJzYWwgaXMgbmVlZGVkXHJcbiAgICAgKiBhbmQgd2UgbmVlZCB0byB1cGRhdGUgYHRoaXMuaGVhZGAgdG8gcG9pbnQgdG8gYG5ld05vZGVgLlxyXG4gICAgICovXHJcbiAgICBpZiAoaW5kZXggPT09IDApIHtcclxuICAgICAgLypcclxuICAgICAgICogRW5zdXJlIHRoZSBuZXcgbm9kZSdzIGBuZXh0YCBwcm9wZXJ0eSBpcyBwb2ludGVkIHRvIHRoZSBjdXJyZW50XHJcbiAgICAgICAqIGhlYWQuXHJcbiAgICAgICAqL1xyXG4gICAgICBuZXdOb2RlLm5leHQgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFRoZSBjdXJyZW50IGhlYWQncyBgcHJldmlvdXNgIHByb3BlcnR5IG5lZWRzIHRvIHBvaW50IHRvIHRoZSBuZXdcclxuICAgICAgICogbm9kZSB0byBlbnN1cmUgdGhlIGxpc3QgaXMgdHJhdmVyc2FibGUgYmFja3dhcmRzLlxyXG4gICAgICAgKi9cclxuICAgICAgdGhpcy5oZWFkLnByZXZpb3VzID0gbmV3Tm9kZVxyXG5cclxuICAgICAgLypcclxuICAgICAgICogTm93IGl0J3Mgc2FmZSB0byBzZXQgYHRoaXMuaGVhZGAgdG8gdGhlIG5ldyBub2RlLCBlZmZlY3RpdmVseVxyXG4gICAgICAgKiBtYWtpbmcgdGhlIG5ldyBub2RlIHRoZSBmaXJzdCBub2RlIGluIHRoZSBsaXN0LlxyXG4gICAgICAgKi9cclxuICAgICAgdGhpcy5oZWFkID0gbmV3Tm9kZVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLypcclxuICAgICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIHRyYWNrIHRoZSBub2RlIHRoYXQgaXMgYmVpbmdcclxuICAgICAgICogdXNlZCBpbnNpZGUgb2YgdGhlIGxvb3AgYmVsb3cuIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG9cclxuICAgICAgICogYHRoaXMuaGVhZGAgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZSBvZiB0aGUgbG9vcC5cclxuICAgICAgICovXHJcbiAgICAgIGxldCBjdXJyZW50ID0gdGhpcy5oZWFkXHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBUaGUgYGlgIHZhcmlhYmxlIGlzIHVzZWQgdG8gdHJhY2sgaG93IGRlZXAgaW50byB0aGUgbGlzdCB3ZSd2ZVxyXG4gICAgICAgKiBnb25lLiBUaGlzIGltcG9ydGFudCBiZWNhdXNlIGl0J3MgdGhlIG9ubHkgd2F5IHRvIGtub3cgd2hlblxyXG4gICAgICAgKiB3ZSd2ZSBoaXQgdGhlIGBpbmRleGAgdG8gaW5zZXJ0IGludG8uXHJcbiAgICAgICAqL1xyXG4gICAgICBsZXQgaSA9IDBcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFRyYXZlcnNlIHRoZSBsaXN0IG5vZGVzIHVzaW5nIGBuZXh0YCBwb2ludGVycywgYW5kIG1ha2VcclxuICAgICAgICogc3VyZSB0byBrZWVwIHRyYWNrIG9mIGhvdyBtYW55IG5vZGVzIGhhdmUgYmVlbiB2aXNpdGVkLiBXaGVuXHJcbiAgICAgICAqIGBpYCBpcyB0aGUgc2FtZSBhcyBgaW5kZXhgLCBpdCBtZWFucyB3ZSd2ZSBmb3VuZCB0aGUgbG9jYXRpb24gdG9cclxuICAgICAgICogaW5zZXJ0IHRoZSBuZXcgZGF0YS5cclxuICAgICAgICovXHJcbiAgICAgIHdoaWxlIChjdXJyZW50Lm5leHQgIT09IG51bGwgJiYgaSA8IGluZGV4KSB7XHJcbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG4gICAgICAgIGkrK1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBBdCB0aGlzIHBvaW50LCBgY3VycmVudGAgaXMgZWl0aGVyIHRoZSBub2RlIHRvIGluc2VydCB0aGUgbmV3IGRhdGFcclxuICAgICAgICogYmVmb3JlLCBvciB0aGUgbGFzdCBub2RlIGluIHRoZSBsaXN0LiBUaGUgb25seSB3YXkgdG8gdGVsbCBpcyBpZlxyXG4gICAgICAgKiBgaWAgaXMgc3RpbGwgbGVzcyB0aGFuIGBpbmRleGAsIHRoYXQgbWVhbnMgdGhlIGluZGV4IGlzIG91dCBvZiByYW5nZVxyXG4gICAgICAgKiBhbmQgYW4gZXJyb3Igc2hvdWxkIGJlIHRocm93bi5cclxuICAgICAgICovXHJcbiAgICAgIGlmIChpIDwgaW5kZXgpIHtcclxuICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgSW5kZXggJHtpbmRleH0gZG9lcyBub3QgZXhpc3QgaW4gdGhlIGxpc3QuYClcclxuICAgICAgfVxyXG5cclxuICAgICAgLypcclxuICAgICAgICogSWYgY29kZSBjb250aW51ZXMgdG8gZXhlY3V0ZSBoZXJlLCBpdCBtZWFucyBgY3VycmVudGAgaXMgdGhlIG5vZGVcclxuICAgICAgICogdG8gaW5zZXJ0IG5ldyBkYXRhIGJlZm9yZS5cclxuICAgICAgICpcclxuICAgICAgICogRmlyc3QsIGluc2VydCBgbmV3Tm9kZWAgYWZ0ZXIgYGN1cnJlbnQucHJldmlvdXNgIGJ5IHVwZGF0aW5nXHJcbiAgICAgICAqIGBjdXJyZW50LnByZXZpb3VzLm5leHRgIGFuZCBgbmV3Tm9kZS5wcmV2aW91c2AuXHJcbiAgICAgICAqL1xyXG4gICAgICBjdXJyZW50IS5wcmV2aW91cyEubmV4dCA9IG5ld05vZGVcclxuICAgICAgbmV3Tm9kZSEucHJldmlvdXMgPSBjdXJyZW50LnByZXZpb3VzXHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBOZXh0LCBpbnNlcnQgYGN1cnJlbnRgIGFmdGVyIGBuZXdOb2RlYCBieSB1cGRhdGluZyBgbmV3Tm9kZS5uZXh0YCBhbmRcclxuICAgICAgICogYGN1cnJlbnQucHJldmlvdXNgLlxyXG4gICAgICAgKi9cclxuICAgICAgbmV3Tm9kZS5uZXh0ID0gY3VycmVudFxyXG4gICAgICBjdXJyZW50LnByZXZpb3VzID0gbmV3Tm9kZVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5zZXJ0cyBzb21lIGRhdGEgaW50byB0aGUgbWlkZGxlIG9mIHRoZSBsaXN0LiBUaGlzIG1ldGhvZCB0cmF2ZXJzZXNcclxuICAgKiB0aGUgZXhpc3RpbmcgbGlzdCBhbmQgcGxhY2VzIHRoZSBkYXRhIGluIGEgbmV3IG5vZGUgYWZ0ZXIgYSBzcGVjaWZpYyBpbmRleC5cclxuICAgKiBAcGFyYW0geyp9IGRhdGEgVGhlIGRhdGEgdG8gYWRkIHRvIHRoZSBsaXN0LlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBUaGUgemVyby1iYXNlZCBpbmRleCBhZnRlciB3aGljaCB0byBpbnNlcnQgdGhlIGRhdGEuXHJcbiAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICogQHRocm93cyB7UmFuZ2VFcnJvcn0gSWYgdGhlIGluZGV4IGRvZXNuJ3QgZXhpc3QgaW4gdGhlIGxpc3QuXHJcbiAgICovXHJcbiAgaW5zZXJ0QWZ0ZXIgKGRhdGE6IFQsIGluZGV4OiBudW1iZXIpOiB2b2lkIHtcclxuICAgIC8qXHJcbiAgICAgKiBDcmVhdGUgYSBuZXcgbGlzdCBub2RlIG9iamVjdCBhbmQgc3RvcmUgdGhlIGRhdGEgaW4gaXQuXHJcbiAgICAgKiBUaGlzIG5vZGUgd2lsbCBiZSBpbnNlcnRlZCBpbnRvIHRoZSBleGlzdGluZyBsaXN0LlxyXG4gICAgICovXHJcbiAgICBjb25zdCBuZXdOb2RlID0gbmV3IERvdWJseUxpbmtlZExpc3ROb2RlKGRhdGEpXHJcblxyXG4gICAgLy8gc3BlY2lhbCBjYXNlOiBubyBub2RlcyBpbiB0aGUgbGlzdCB5ZXRcclxuICAgIGlmICh0aGlzLmhlYWQgPT09IG51bGwpIHtcclxuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYEluZGV4ICR7aW5kZXh9IGRvZXMgbm90IGV4aXN0IGluIHRoZSBsaXN0LmApXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayB0aGUgbm9kZSB0aGF0IGlzIGJlaW5nXHJcbiAgICAgKiB1c2VkIGluc2lkZSBvZiB0aGUgbG9vcCBiZWxvdy4gSXQgc3RhcnRzIG91dCBwb2ludGluZyB0b1xyXG4gICAgICogYHRoaXMuaGVhZGAgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZSBvZiB0aGUgbG9vcC5cclxuICAgICAqL1xyXG4gICAgbGV0IGN1cnJlbnQ6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgbnVsbCA9IHRoaXMuaGVhZFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGlgIHZhcmlhYmxlIGlzIHVzZWQgdG8gdHJhY2sgaG93IGRlZXAgaW50byB0aGUgbGlzdCB3ZSd2ZVxyXG4gICAgICogZ29uZS4gVGhpcyBpbXBvcnRhbnQgYmVjYXVzZSBpdCdzIHRoZSBvbmx5IHdheSB0byBrbm93IHdoZW5cclxuICAgICAqIHdlJ3ZlIGhpdCB0aGUgYGluZGV4YCB0byBpbnNlcnQgaW50by5cclxuICAgICAqL1xyXG4gICAgbGV0IGkgPSAwXHJcblxyXG4gICAgLypcclxuICAgICAqIFRyYXZlcnNlIHRoZSBsaXN0IG5vZGVzIHNpbWlsYXIgdG8gdGhlIGBhZGQoKWAgbWV0aG9kLCBidXQgbWFrZVxyXG4gICAgICogc3VyZSB0byBrZWVwIHRyYWNrIG9mIGhvdyBtYW55IG5vZGVzIGhhdmUgYmVlbiB2aXNpdGVkIGFuZCB1cGRhdGVcclxuICAgICAqIHRoZSBgcHJldmlvdXNgIHBvaW50ZXIgaW4gYWRkaXRpb24gdG8gYGN1cnJlbnRgLiBXaGVuXHJcbiAgICAgKiBgaWAgaXMgdGhlIHNhbWUgYXMgYGluZGV4YCwgaXQgbWVhbnMgd2UndmUgZm91bmQgdGhlIGxvY2F0aW9uIHRvXHJcbiAgICAgKiBpbnNlcnQgdGhlIG5ldyBkYXRhLlxyXG4gICAgICovXHJcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCAmJiBpIDwgaW5kZXgpIHtcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG4gICAgICBpKytcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogQXQgdGhpcyBwb2ludCwgYGN1cnJlbnRgIGlzIGVpdGhlciB0aGUgbm9kZSB0byBpbnNlcnQgdGhlIG5ldyBkYXRhXHJcbiAgICAgKiBiZWZvcmUsIG9yIHRoZSBsYXN0IG5vZGUgaW4gdGhlIGxpc3QuIFRoZSBvbmx5IHdheSB0byB0ZWxsIGlzIGlmXHJcbiAgICAgKiBgaWAgaXMgc3RpbGwgbGVzcyB0aGFuIGBpbmRleGAsIHRoYXQgbWVhbnMgdGhlIGluZGV4IGlzIG91dCBvZiByYW5nZVxyXG4gICAgICogYW5kIGFuIGVycm9yIHNob3VsZCBiZSB0aHJvd24uXHJcbiAgICAgKi9cclxuICAgIGlmIChpIDwgaW5kZXgpIHtcclxuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYEluZGV4ICR7aW5kZXh9IGRvZXMgbm90IGV4aXN0IGluIHRoZSBsaXN0LmApXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIElmIGNvZGUgY29udGludWVzIHRvIGV4ZWN1dGUgaGVyZSwgaXQgbWVhbnMgYGN1cnJlbnRgIGlzIHRoZSBub2RlXHJcbiAgICAgKiB0byBpbnNlcnQgbmV3IGRhdGEgYWZ0ZXIuXHJcbiAgICAgKi9cclxuXHJcbiAgICAvLyBzcGVjaWFsIGNhc2U6IGBjdXJyZW50YCBpcyB0aGUgdGFpbCwgc28gcmVzZXQgYHRoaXMudGFpbGBcclxuICAgIGlmICh0aGlzLnRhaWwgPT09IGN1cnJlbnQpIHtcclxuICAgICAgdGhpcy50YWlsID0gbmV3Tm9kZVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLypcclxuICAgICAgICogT3RoZXJ3aXNlLCBpbnNlcnQgYG5ld05vZGVgIGJlZm9yZSBgY3VycmVudC5uZXh0YCBieSB1cGRhdGluZ1xyXG4gICAgICAgKiBgY3VycmVudC5uZXh0LnByZXZpb3VzYCBhbmQgYG5ld05vZGUubm9kZWAuXHJcbiAgICAgICAqL1xyXG4gICAgICBjdXJyZW50IS5uZXh0IS5wcmV2aW91cyA9IG5ld05vZGVcclxuICAgICAgbmV3Tm9kZS5uZXh0ID0gY3VycmVudCEubmV4dFxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBOZXh0LCBpbnNlcnQgYG5ld05vZGVgIGFmdGVyIGBjdXJyZW50YCBieSB1cGRhdGluZyBgbmV3Tm9kZS5wcmV2aW91c2AgYW5kXHJcbiAgICAgKiBgY3VycmVudC5uZXh0YC5cclxuICAgICAqL1xyXG4gICAgbmV3Tm9kZS5wcmV2aW91cyA9IGN1cnJlbnRcclxuICAgIGN1cnJlbnQhLm5leHQgPSBuZXdOb2RlXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXRyaWV2ZXMgdGhlIGRhdGEgaW4gdGhlIGdpdmVuIHBvc2l0aW9uIGluIHRoZSBsaXN0LlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBUaGUgemVyby1iYXNlZCBpbmRleCBvZiB0aGUgbm9kZSB3aG9zZSBkYXRhXHJcbiAgICogICAgICBzaG91bGQgYmUgcmV0dXJuZWQuXHJcbiAgICogQHJldHVybnMgeyp9IFRoZSBkYXRhIGluIHRoZSBcImRhdGFcIiBwb3J0aW9uIG9mIHRoZSBnaXZlbiBub2RlXHJcbiAgICogICAgICBvciB1bmRlZmluZWQgaWYgdGhlIG5vZGUgZG9lc24ndCBleGlzdC5cclxuICAgKi9cclxuICBnZXQgKGluZGV4OiBudW1iZXIpOiBUIHtcclxuICAgIC8vIGVuc3VyZSBgaW5kZXhgIGlzIGEgcG9zaXRpdmUgdmFsdWVcclxuICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgIC8qXHJcbiAgICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byB0cmFjayB0aGUgbm9kZSB0aGF0IGlzIGJlaW5nXHJcbiAgICAgICAqIHVzZWQgaW5zaWRlIG9mIHRoZSBsb29wIGJlbG93LiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvXHJcbiAgICAgICAqIGB0aGlzLmhlYWRgIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGUgb2YgdGhlIGxvb3AuXHJcbiAgICAgICAqL1xyXG4gICAgICBsZXQgY3VycmVudCA9IHRoaXMuaGVhZFxyXG5cclxuICAgICAgLypcclxuICAgICAgICogVGhlIGBpYCB2YXJpYWJsZSBpcyB1c2VkIHRvIHRyYWNrIGhvdyBkZWVwIGludG8gdGhlIGxpc3Qgd2UndmVcclxuICAgICAgICogZ29uZS4gVGhpcyBpcyBpbXBvcnRhbnQgYmVjYXVzZSBpdCdzIHRoZSBvbmx5IHdheSB0byBrbm93IHdoZW5cclxuICAgICAgICogd2UndmUgaGl0IHRoZSBgaW5kZXhgIHRvIGluc2VydCBpbnRvLlxyXG4gICAgICAgKi9cclxuICAgICAgbGV0IGkgPSAwXHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBUcmF2ZXJzZSB0aGUgbGlzdCBub2RlcywgYnV0IG1ha2Ugc3VyZSB0byBrZWVwIHRyYWNrIG9mIGhvdyBtYW55XHJcbiAgICAgICAqIG5vZGVzIGhhdmUgYmVlbiB2aXNpdGVkIGFuZCB1cGRhdGUgdGhlIGBwcmV2aW91c2AgcG9pbnRlciBpblxyXG4gICAgICAgKiBhZGRpdGlvbiB0byBgY3VycmVudGAuIFdoZW4gYGlgIGlzIHRoZSBzYW1lIGFzIGBpbmRleGAsIGl0IG1lYW5zXHJcbiAgICAgICAqIHdlJ3ZlIGZvdW5kIHRoZSBsb2NhdGlvbiB0byBpbnNlcnQgdGhlIG5ldyBkYXRhLlxyXG4gICAgICAgKi9cclxuICAgICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwgJiYgaSA8IGluZGV4KSB7XHJcbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG4gICAgICAgIGkrK1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBBdCB0aGlzIHBvaW50LCBgY3VycmVudGAgbWlnaHQgYmUgbnVsbCBpZiB3ZSd2ZSBnb25lIHBhc3QgdGhlXHJcbiAgICAgICAqIGVuZCBvZiB0aGUgbGlzdC4gSW4gdGhhdCBjYXNlLCB3ZSByZXR1cm4gYHVuZGVmaW5lZGAgdG8gaW5kaWNhdGVcclxuICAgICAgICogdGhhdCB0aGUgbm9kZSBhdCBgaW5kZXhgIHdhcyBub3QgZm91bmQuIElmIGBjdXJyZW50YCBpcyBub3RcclxuICAgICAgICogYG51bGxgLCB0aGVuIGl0J3Mgc2FmZSB0byByZXR1cm4gYGN1cnJlbnQuZGF0YWAuXHJcbiAgICAgICAqL1xyXG4gICAgICBpZiAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiBjdXJyZW50LmRhdGFcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgaW5kZXggJHtpbmRleH0gb3V0IG9mIHJhbmdlYClcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYGluZGV4ICR7aW5kZXh9IG91dCBvZiByYW5nZWApXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXRyaWV2ZXMgdGhlIGluZGV4IG9mIHRoZSBkYXRhIGluIHRoZSBsaXN0LlxyXG4gICAqIEBwYXJhbSB7VH0gZGF0YSBUaGUgZGF0YSB0byBzZWFyY2ggZm9yLlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBpbmRleCBvZiB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgdGhlIGRhdGEgaW4gdGhlIGxpc3RcclxuICAgKiAgICAgIG9yIC0xIGlmIG5vdCBmb3VuZC5cclxuICAgKi9cclxuICBpbmRleE9mIChkYXRhOiBUKTogbnVtYmVyIHtcclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gaXRlcmF0ZSBvdmVyIHRoZSBsaXN0IG5vZGVzLlxyXG4gICAgICogSXQgc3RhcnRzIG91dCBwb2ludGluZyB0byB0aGUgaGVhZCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlXHJcbiAgICAgKiBvZiB0aGUgbG9vcCBiZWxvdy5cclxuICAgICAqL1xyXG4gICAgbGV0IGN1cnJlbnQ6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgbnVsbCA9IHRoaXMuaGVhZFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGluZGV4YCB2YXJpYWJsZSBpcyB1c2VkIHRvIHRyYWNrIGhvdyBkZWVwIGludG8gdGhlIGxpc3Qgd2UndmVcclxuICAgICAqIGdvbmUuIFRoaXMgaXMgaW1wb3J0YW50IGJlY2F1c2UgdGhpcyBpcyB0aGUgdmFsdWUgdGhhdCBpcyByZXR1cm5lZFxyXG4gICAgICogZnJvbSB0aGlzIG1ldGhvZC5cclxuICAgICAqL1xyXG4gICAgbGV0IGluZGV4ID0gMFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGlzIGxvb3AgY2hlY2tzIGVhY2ggbm9kZSBpbiB0aGUgbGlzdCB0byBzZWUgaWYgaXQgbWF0Y2hlcyBgZGF0YWAuXHJcbiAgICAgKiBJZiBhIG1hdGNoIGlzIGZvdW5kLCBpdCByZXR1cm5zIGBpbmRleGAgaW1tZWRpYXRlbHksIGV4aXRpbmcgdGhlXHJcbiAgICAgKiBsb29wIGJlY2F1c2UgdGhlcmUncyBubyByZWFzb24gdG8ga2VlcCBzZWFyY2hpbmcuIFRoZSBzZWFyY2hcclxuICAgICAqIGNvbnRpbnVlcyB1bnRpbCB0aGVyZSBhcmUgbm8gbW9yZSBub2RlcyB0byBzZWFyY2ggKHdoZW4gYGN1cnJlbnRgIGlzIGBudWxsYCkuXHJcbiAgICAgKi9cclxuICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsKSB7XHJcbiAgICAgIGlmIChjdXJyZW50LmRhdGEgPT09IGRhdGEpIHtcclxuICAgICAgICByZXR1cm4gaW5kZXhcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gdHJhdmVyc2UgdG8gdGhlIG5leHQgbm9kZSBpbiB0aGUgbGlzdFxyXG4gICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0XHJcblxyXG4gICAgICAvLyBrZWVwIHRyYWNrIG9mIHdoZXJlIHdlIGFyZVxyXG4gICAgICBpbmRleCsrXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIElmIGV4ZWN1dGlvbiBnZXRzIHRvIHRoaXMgcG9pbnQsIGl0IG1lYW5zIHdlIHJlYWNoZWQgdGhlIGVuZCBvZiB0aGVcclxuICAgICAqIGxpc3QgYW5kIGRpZG4ndCBmaW5kIGBkYXRhYC4gSnVzdCByZXR1cm4gLTEgYXMgdGhlIFwibm90IGZvdW5kXCIgdmFsdWUuXHJcbiAgICAgKi9cclxuICAgIHJldHVybiAtMVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgZmlyc3QgaXRlbSB0aGF0IG1hdGNoZXMgYSBnaXZlbiBmdW5jdGlvbi5cclxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBtYXRjaGVyIEEgZnVuY3Rpb24gcmV0dXJuaW5nIHRydWUgd2hlbiBhbiBpdGVtIG1hdGNoZXNcclxuICAgKiAgICAgIGFuZCBmYWxzZSB3aGVuIGFuIGl0ZW0gZG9lc24ndCBtYXRjaC5cclxuICAgKiBAcmV0dXJucyB7Kn0gVGhlIGZpcnN0IGl0ZW0gdGhhdCByZXR1cm5zIHRydWUgZnJvbSB0aGUgbWF0Y2hlciwgdW5kZWZpbmVkXHJcbiAgICogICAgICBpZiBubyBpdGVtcyBtYXRjaC5cclxuICAgKi9cclxuICBmaW5kIChtYXRjaGVyOiAoYXJnMDogVCkgPT4gYm9vbGVhbiwgYXNOb2RlID0gZmFsc2UpIDogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBUIHtcclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gaXRlcmF0ZSBvdmVyIHRoZSBsaXN0IG5vZGVzLlxyXG4gICAgICogSXQgc3RhcnRzIG91dCBwb2ludGluZyB0byB0aGUgaGVhZCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlXHJcbiAgICAgKiBvZiB0aGUgbG9vcCBiZWxvdy5cclxuICAgICAqL1xyXG4gICAgbGV0IGN1cnJlbnQgPSB0aGlzLmhlYWRcclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhpcyBsb29wIGNoZWNrcyBlYWNoIG5vZGUgaW4gdGhlIGxpc3QgdG8gc2VlIGlmIGl0IG1hdGNoZXMuXHJcbiAgICAgKiBJZiBhIG1hdGNoIGlzIGZvdW5kLCBpdCByZXR1cm5zIHRoZSBkYXRhIGltbWVkaWF0ZWx5LCBleGl0aW5nIHRoZVxyXG4gICAgICogbG9vcCBiZWNhdXNlIHRoZXJlJ3Mgbm8gcmVhc29uIHRvIGtlZXAgc2VhcmNoaW5nLiBUaGUgc2VhcmNoXHJcbiAgICAgKiBjb250aW51ZXMgdW50aWwgdGhlcmUgYXJlIG5vIG1vcmUgbm9kZXMgdG8gc2VhcmNoICh3aGVuIGBjdXJyZW50YCBpcyBgbnVsbGApLlxyXG4gICAgICovXHJcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICBpZiAobWF0Y2hlcihjdXJyZW50LmRhdGEpKSB7XHJcbiAgICAgICAgaWYgKGFzTm9kZSkge1xyXG4gICAgICAgICAgcmV0dXJuIGN1cnJlbnRcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGN1cnJlbnQuZGF0YVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB0cmF2ZXJzZSB0byB0aGUgbmV4dCBub2RlIGluIHRoZSBsaXN0XHJcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogSWYgZXhlY3V0aW9uIGdldHMgdG8gdGhpcyBwb2ludCwgaXQgbWVhbnMgd2UgcmVhY2hlZCB0aGUgZW5kIG9mIHRoZVxyXG4gICAgICogbGlzdCBhbmQgZGlkbid0IGZpbmQgYGRhdGFgLiBKdXN0IHJldHVybiBgdW5kZWZpbmVkYCBhcyB0aGVcclxuICAgICAqIFwibm90IGZvdW5kXCIgdmFsdWUuXHJcbiAgICAgKi9cclxuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdObyBtYXRjaGluZyBkYXRhIGZvdW5kJylcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBmaXJzdCBpdGVtIHRoYXQgbWF0Y2hlcyBhIGdpdmVuIGZ1bmN0aW9uLlxyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG1hdGNoZXIgQSBmdW5jdGlvbiByZXR1cm5pbmcgdHJ1ZSB3aGVuIGFuIGl0ZW0gbWF0Y2hlc1xyXG4gICAqICAgICAgYW5kIGZhbHNlIHdoZW4gYW4gaXRlbSBkb2Vzbid0IG1hdGNoLlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBpbmRleCBvZiB0aGUgZmlyc3QgaXRlbSB0aGF0IG1hdGNoZXMgYSBnaXZlbiBmdW5jdGlvblxyXG4gICAqICAgICAgb3IgLTEgaWYgdGhlcmUgYXJlIG5vIG1hdGNoaW5nIGl0ZW1zLlxyXG4gICAqL1xyXG4gIGZpbmRJbmRleCAobWF0Y2hlcjogKGFyZzA6IFQpID0+IGJvb2xlYW4pOiBudW1iZXIge1xyXG4gICAgLypcclxuICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byBpdGVyYXRlIG92ZXIgdGhlIGxpc3Qgbm9kZXMuXHJcbiAgICAgKiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvIHRoZSBoZWFkIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGVcclxuICAgICAqIG9mIHRoZSBsb29wIGJlbG93LlxyXG4gICAgICovXHJcbiAgICBsZXQgY3VycmVudCA9IHRoaXMuaGVhZFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGluZGV4YCB2YXJpYWJsZSBpcyB1c2VkIHRvIHRyYWNrIGhvdyBkZWVwIGludG8gdGhlIGxpc3Qgd2UndmVcclxuICAgICAqIGdvbmUuIFRoaXMgaXMgaW1wb3J0YW50IGJlY2F1c2UgdGhpcyBpcyB0aGUgdmFsdWUgdGhhdCBpcyByZXR1cm5lZFxyXG4gICAgICogZnJvbSB0aGlzIG1ldGhvZC5cclxuICAgICAqL1xyXG4gICAgbGV0IGluZGV4ID0gMFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGlzIGxvb3AgY2hlY2tzIGVhY2ggbm9kZSBpbiB0aGUgbGlzdCB0byBzZWUgaWYgaXQgbWF0Y2hlcy5cclxuICAgICAqIElmIGEgbWF0Y2ggaXMgZm91bmQsIGl0IHJldHVybnMgdGhlIGluZGV4IGltbWVkaWF0ZWx5LCBleGl0aW5nIHRoZVxyXG4gICAgICogbG9vcCBiZWNhdXNlIHRoZXJlJ3Mgbm8gcmVhc29uIHRvIGtlZXAgc2VhcmNoaW5nLiBUaGUgc2VhcmNoXHJcbiAgICAgKiBjb250aW51ZXMgdW50aWwgdGhlcmUgYXJlIG5vIG1vcmUgbm9kZXMgdG8gc2VhcmNoICh3aGVuIGBjdXJyZW50YCBpcyBgbnVsbGApLlxyXG4gICAgICovXHJcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCkge1xyXG4gICAgICBpZiAobWF0Y2hlcihjdXJyZW50LmRhdGEpKSB7XHJcbiAgICAgICAgcmV0dXJuIGluZGV4XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHRyYXZlcnNlIHRvIHRoZSBuZXh0IG5vZGUgaW4gdGhlIGxpc3RcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG5cclxuICAgICAgLy8ga2VlcCB0cmFjayBvZiB3aGVyZSB3ZSBhcmVcclxuICAgICAgaW5kZXgrK1xyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBJZiBleGVjdXRpb24gZ2V0cyB0byB0aGlzIHBvaW50LCBpdCBtZWFucyB3ZSByZWFjaGVkIHRoZSBlbmQgb2YgdGhlXHJcbiAgICAgKiBsaXN0IGFuZCBkaWRuJ3QgZmluZCBgZGF0YWAuIEp1c3QgcmV0dXJuIC0xIGFzIHRoZVxyXG4gICAgICogXCJub3QgZm91bmRcIiB2YWx1ZS5cclxuICAgICAqL1xyXG4gICAgcmV0dXJuIC0xXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIHRoZSBub2RlIGZyb20gdGhlIGdpdmVuIGxvY2F0aW9uIGluIHRoZSBsaXN0LlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBUaGUgemVyby1iYXNlZCBpbmRleCBvZiB0aGUgbm9kZSB0byByZW1vdmUuXHJcbiAgICogQHJldHVybnMgeyp9IFRoZSBkYXRhIGluIHRoZSBnaXZlbiBwb3NpdGlvbiBpbiB0aGUgbGlzdC5cclxuICAgKiBAdGhyb3dzIHtSYW5nZUVycm9yfSBJZiBpbmRleCBpcyBvdXQgb2YgcmFuZ2UuXHJcbiAgICovXHJcbiAgcmVtb3ZlIChpbmRleDogbnVtYmVyKSA6IFQge1xyXG4gICAgLy8gc3BlY2lhbCBjYXNlczogbm8gbm9kZXMgaW4gdGhlIGxpc3Qgb3IgYGluZGV4YCBpcyBuZWdhdGl2ZVxyXG4gICAgaWYgKHRoaXMuaGVhZCA9PT0gbnVsbCB8fCBpbmRleCA8IDApIHtcclxuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYEluZGV4ICR7aW5kZXh9IGRvZXMgbm90IGV4aXN0IGluIHRoZSBsaXN0LmApXHJcbiAgICB9XHJcblxyXG4gICAgLy8gc3BlY2lhbCBjYXNlOiByZW1vdmluZyB0aGUgZmlyc3Qgbm9kZVxyXG4gICAgaWYgKGluZGV4ID09PSAwKSB7XHJcbiAgICAgIC8vIHN0b3JlIHRoZSBkYXRhIGZyb20gdGhlIGN1cnJlbnQgaGVhZFxyXG4gICAgICBjb25zdCBkYXRhOiBUID0gdGhpcy5oZWFkLmRhdGFcclxuXHJcbiAgICAgIC8vIGp1c3QgcmVwbGFjZSB0aGUgaGVhZCB3aXRoIHRoZSBuZXh0IG5vZGUgaW4gdGhlIGxpc3RcclxuICAgICAgdGhpcy5oZWFkID0gdGhpcy5oZWFkLm5leHRcclxuXHJcbiAgICAgIC8vIHNwZWNpYWwgY2FzZTogdGhlcmUgd2FzIG9ubHkgb25lIG5vZGUsIHNvIGFsc28gcmVzZXQgYHRoaXMudGFpbGBcclxuICAgICAgaWYgKHRoaXMuaGVhZCA9PT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMudGFpbCA9IG51bGxcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmhlYWQucHJldmlvdXMgPSBudWxsXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHJldHVybiB0aGUgZGF0YSBhdCB0aGUgcHJldmlvdXMgaGVhZCBvZiB0aGUgbGlzdFxyXG4gICAgICByZXR1cm4gZGF0YVxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gaXRlcmF0ZSBvdmVyIHRoZSBsaXN0IG5vZGVzLlxyXG4gICAgICogSXQgc3RhcnRzIG91dCBwb2ludGluZyB0byB0aGUgaGVhZCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlXHJcbiAgICAgKiBvZiB0aGUgbG9vcCBiZWxvdy5cclxuICAgICAqL1xyXG4gICAgbGV0IGN1cnJlbnQ6IERvdWJseUxpbmtlZExpc3ROb2RlPFQ+IHwgbnVsbCA9IHRoaXMuaGVhZFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGlgIHZhcmlhYmxlIGlzIHVzZWQgdG8gdHJhY2sgaG93IGRlZXAgaW50byB0aGUgbGlzdCB3ZSd2ZVxyXG4gICAgICogZ29uZS4gVGhpcyBpcyBpbXBvcnRhbnQgYmVjYXVzZSBpdCdzIHRoZSBvbmx5IHdheSB0byBrbm93IHdoZW5cclxuICAgICAqIHdlJ3ZlIGhpdCB0aGUgYGluZGV4YCB0byByZW1vdmUuXHJcbiAgICAgKi9cclxuICAgIGxldCBpID0gMFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUcmF2ZXJzZSB0aGUgbGlzdCBub2RlcyBzaW1pbGFyIHRvIHRoZSBgZ2V0KClgIG1ldGhvZCwgYnV0IG1ha2VcclxuICAgICAqIHN1cmUgdG8ga2VlcCB0cmFjayBvZiBob3cgbWFueSBub2RlcyBoYXZlIGJlZW4gdmlzaXRlZC4gV2hlblxyXG4gICAgICogYGlgIGlzIHRoZSBzYW1lIGFzIGBpbmRleGAsIGl0IG1lYW5zIHdlJ3ZlIGZvdW5kIHRoZSBsb2NhdGlvbiB0b1xyXG4gICAgICogcmVtb3ZlLlxyXG4gICAgICovXHJcbiAgICB3aGlsZSAoY3VycmVudCAhPT0gbnVsbCAmJiBpIDwgaW5kZXgpIHtcclxuICAgICAgLy8gdHJhdmVyc2UgdG8gdGhlIG5leHQgbm9kZVxyXG4gICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0XHJcblxyXG4gICAgICAvLyBpbmNyZW1lbnQgdGhlIGNvdW50XHJcbiAgICAgIGkrK1xyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBJZiBgY3VycmVudGAgaXNuJ3QgYG51bGxgLCB0aGVuIHRoYXQgbWVhbnMgd2UndmUgZm91bmQgdGhlIG5vZGVcclxuICAgICAqIHRvIHJlbW92ZS5cclxuICAgICAqL1xyXG4gICAgaWYgKGN1cnJlbnQgIT09IG51bGwpIHtcclxuICAgICAgLy8gc2tpcCBvdmVyIHRoZSBub2RlIHRvIHJlbW92ZVxyXG4gICAgICBjdXJyZW50IS5wcmV2aW91cyEubmV4dCA9IGN1cnJlbnQubmV4dFxyXG5cclxuICAgICAgLypcclxuICAgICAgICogSWYgd2UgYXJlIGF0IHRoZSBlbmQgb2YgdGhlIGxpc3QsIHRoZW4gdXBkYXRlIGB0aGlzLnRhaWxgLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBJZiB3ZSBhcmUgbm90IGF0IHRoZSBlbmQgb2YgdGhlIGxpc3QsIHRoZW4gdXBkYXRlIHRoZSBiYWNrd2FyZHNcclxuICAgICAgICogcG9pbnRlciBmb3IgYGN1cnJlbnQubmV4dGAgdG8gcHJlc2VydmUgcmV2ZXJzZSB0cmF2ZXJzYWwuXHJcbiAgICAgICAqL1xyXG4gICAgICBpZiAodGhpcy50YWlsID09PSBjdXJyZW50KSB7XHJcbiAgICAgICAgdGhpcy50YWlsID0gY3VycmVudC5wcmV2aW91c1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGN1cnJlbnQhLm5leHQhLnByZXZpb3VzID0gY3VycmVudC5wcmV2aW91c1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyByZXR1cm4gdGhlIHZhbHVlIHRoYXQgd2FzIGp1c3QgcmVtb3ZlZCBmcm9tIHRoZSBsaXN0XHJcbiAgICAgIHJldHVybiBjdXJyZW50LmRhdGFcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogSWYgd2UndmUgbWFkZSBpdCB0aGlzIGZhciwgaXQgbWVhbnMgYGluZGV4YCBpcyBhIHZhbHVlIHRoYXRcclxuICAgICAqIGRvZXNuJ3QgZXhpc3QgaW4gdGhlIGxpc3QsIHNvIHRocm93IGFuIGVycm9yLlxyXG4gICAgICovXHJcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgSW5kZXggJHtpbmRleH0gZG9lcyBub3QgZXhpc3QgaW4gdGhlIGxpc3QuYClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYWxsIG5vZGVzIGZyb20gdGhlIGxpc3QuXHJcbiAgICogQHJldHVybnMge3ZvaWR9XHJcbiAgICovXHJcbiAgY2xlYXIgKCk6IHZvaWQge1xyXG4gICAgLy8ganVzdCByZXNldCBib3RoIHRoZSBoZWFkIGFuZCB0YWlsIHBvaW50ZXIgdG8gbnVsbFxyXG4gICAgdGhpcy5oZWFkID0gbnVsbFxyXG4gICAgdGhpcy50YWlsID0gbnVsbFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIG5vZGVzIGluIHRoZSBsaXN0LlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBudW1iZXIgb2Ygbm9kZXMgaW4gdGhlIGxpc3QuXHJcbiAgICovXHJcbiAgZ2V0IHNpemUgKCk6IG51bWJlciB7XHJcbiAgICAvLyBzcGVjaWFsIGNhc2U6IHRoZSBsaXN0IGlzIGVtcHR5XHJcbiAgICBpZiAodGhpcy5oZWFkID09PSBudWxsKSB7XHJcbiAgICAgIHJldHVybiAwXHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBgY3VycmVudGAgdmFyaWFibGUgaXMgdXNlZCB0byBpdGVyYXRlIG92ZXIgdGhlIGxpc3Qgbm9kZXMuXHJcbiAgICAgKiBJdCBzdGFydHMgb3V0IHBvaW50aW5nIHRvIHRoZSBoZWFkIGFuZCBpcyBvdmVyd3JpdHRlbiBpbnNpZGVcclxuICAgICAqIG9mIHRoZSBsb29wIGJlbG93LlxyXG4gICAgICovXHJcbiAgICBsZXQgY3VycmVudDogRG91Ymx5TGlua2VkTGlzdE5vZGU8VD4gfCBudWxsID0gdGhpcy5oZWFkXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBgY291bnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8ga2VlcCB0cmFjayBvZiBob3cgbWFueSBub2RlcyBoYXZlXHJcbiAgICAgKiBiZWVuIHZpc2l0ZWQgaW5zaWRlIHRoZSBsb29wIGJlbG93LiBUaGlzIGlzIGltcG9ydGFudCBiZWNhdXNlIHRoaXNcclxuICAgICAqIGlzIHRoZSB2YWx1ZSB0byByZXR1cm4gZnJvbSB0aGlzIG1ldGhvZC5cclxuICAgICAqL1xyXG4gICAgbGV0IGNvdW50ID0gMFxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBBcyBsb25nIGFzIGBjdXJyZW50YCBpcyBub3QgYG51bGxgLCB0aGF0IG1lYW5zIHdlJ3JlIG5vdCB5ZXQgYXQgdGhlXHJcbiAgICAgKiBlbmQgb2YgdGhlIGxpc3QsIHNvIGFkZGluZyAxIHRvIGBjb3VudGAgYW5kIHRyYXZlcnNlIHRvIHRoZSBuZXh0IG5vZGUuXHJcbiAgICAgKi9cclxuICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsKSB7XHJcbiAgICAgIGNvdW50KytcclxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBXaGVuIGBjdXJyZW50YCBpcyBgbnVsbGAsIHRoZSBsb29wIGlzIGV4aXRlZCBhdCB0aGUgdmFsdWUgb2YgYGNvdW50YFxyXG4gICAgICogaXMgdGhlIG51bWJlciBvZiBub2RlcyB0aGF0IHdlcmUgY291bnRlZCBpbiB0aGUgbG9vcC5cclxuICAgICAqL1xyXG4gICAgcmV0dXJuIGNvdW50XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgZGVmYXVsdCBpdGVyYXRvciBmb3IgdGhlIGNsYXNzLlxyXG4gICAqIEByZXR1cm5zIHtJdGVyYXRvcn0gQW4gaXRlcmF0b3IgZm9yIHRoZSBjbGFzcy5cclxuICAgKi9cclxuICBbU3ltYm9sLml0ZXJhdG9yXSAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy52YWx1ZXMoKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIGFuIGl0ZXJhdG9yIHRoYXQgcmV0dXJucyBlYWNoIG5vZGUgaW4gdGhlIGxpc3QuXHJcbiAgICogQHJldHVybnMge0dlbmVyYXRvcn0gQW4gaXRlcmF0b3Igb24gdGhlIGxpc3QuXHJcbiAgICovXHJcbiAgKiB2YWx1ZXMgKCk6IEdlbmVyYXRvcjxULCB2b2lkLCB1bmtub3duPiB7XHJcbiAgICAvKlxyXG4gICAgICogVGhlIGBjdXJyZW50YCB2YXJpYWJsZSBpcyB1c2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgbGlzdCBub2Rlcy5cclxuICAgICAqIEl0IHN0YXJ0cyBvdXQgcG9pbnRpbmcgdG8gdGhlIGhlYWQgYW5kIGlzIG92ZXJ3cml0dGVuIGluc2lkZVxyXG4gICAgICogb2YgdGhlIGxvb3AgYmVsb3cuXHJcbiAgICAgKi9cclxuICAgIGxldCBjdXJyZW50ID0gdGhpcy5oZWFkXHJcblxyXG4gICAgLypcclxuICAgICAqIEFzIGxvbmcgYXMgYGN1cnJlbnRgIGlzIG5vdCBgbnVsbGAsIHRoZXJlIGlzIGEgcGllY2Ugb2YgZGF0YVxyXG4gICAgICogdG8geWllbGQuXHJcbiAgICAgKi9cclxuICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsKSB7XHJcbiAgICAgIHlpZWxkIGN1cnJlbnQuZGF0YVxyXG4gICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgYW4gaXRlcmF0b3IgdGhhdCByZXR1cm5zIGVhY2ggbm9kZSBpbiB0aGUgbGlzdCBpbiByZXZlcnNlIG9yZGVyLlxyXG4gICAqIEByZXR1cm5zIHtHZW5lcmF0b3J9IEFuIGl0ZXJhdG9yIG9uIHRoZSBsaXN0LlxyXG4gICAqL1xyXG4gICogcmV2ZXJzZSAoKTogR2VuZXJhdG9yPFQsIHZvaWQsIHVua25vd24+IHtcclxuICAgIC8qXHJcbiAgICAgKiBUaGUgYGN1cnJlbnRgIHZhcmlhYmxlIGlzIHVzZWQgdG8gaXRlcmF0ZSBvdmVyIHRoZSBsaXN0IG5vZGVzLlxyXG4gICAgICogSXQgc3RhcnRzIG91dCBwb2ludGluZyB0byB0aGUgdGFpbCBhbmQgaXMgb3ZlcndyaXR0ZW4gaW5zaWRlXHJcbiAgICAgKiBvZiB0aGUgbG9vcCBiZWxvdy5cclxuICAgICAqL1xyXG4gICAgbGV0IGN1cnJlbnQgPSB0aGlzLnRhaWxcclxuXHJcbiAgICAvKlxyXG4gICAgICogQXMgbG9uZyBhcyBgY3VycmVudGAgaXMgbm90IGBudWxsYCwgdGhlcmUgaXMgYSBwaWVjZSBvZiBkYXRhXHJcbiAgICAgKiB0byB5aWVsZC5cclxuICAgICAqL1xyXG4gICAgd2hpbGUgKGN1cnJlbnQgIT09IG51bGwpIHtcclxuICAgICAgeWllbGQgY3VycmVudC5kYXRhXHJcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50LnByZXZpb3VzXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZXJ0cyB0aGUgbGlzdCBpbnRvIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uLlxyXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBsaXN0LlxyXG4gICAqL1xyXG4gIHRvU3RyaW5nICgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIFsuLi50aGlzXS50b1N0cmluZygpXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBEb3VibHlMaW5rZWRMaXN0XHJcbmV4cG9ydCBmdW5jdGlvblxyXG5hcnJheVRvRG91Ymx5TGlua2VkTGlzdCA8VD4gKGFycjogQXJyYXk8VD4pIHtcclxuICBjb25zdCBsaXN0ID0gbmV3IERvdWJseUxpbmtlZExpc3Q8VD4oKVxyXG4gIGFyci5mb3JFYWNoKChkYXRhKSA9PiB7XHJcbiAgICBsaXN0LmFkZChkYXRhKVxyXG4gIH0pXHJcblxyXG4gIHJldHVybiBsaXN0XHJcbn1cclxuIiwiaW1wb3J0IHtcclxuICBjb25maWcsXHJcbiAgcHJvbWlzZUhhbmRsZXIsXHJcbiAgaHRtbFRvRWwsXHJcbiAgYWRkUmVzaXplRHJhZyxcclxuICBtaWxsaXNUb01pbnV0ZXNBbmRTZWNvbmRzLFxyXG4gIHRocm93RXhwcmVzc2lvblxyXG59IGZyb20gJy4uL2NvbmZpZydcclxuaW1wb3J0IHsgRG91Ymx5TGlua2VkTGlzdE5vZGUgfSBmcm9tICcuL2RvdWJseS1saW5rZWQtbGlzdCdcclxuaW1wb3J0IFBsYXlhYmxlRXZlbnRBcmcgZnJvbSAnLi9wdWJzdWIvZXZlbnQtYXJncy90cmFjay1wbGF5LWFyZ3MnXHJcbmltcG9ydCBheGlvcywgeyBBeGlvc1Jlc3BvbnNlIH0gZnJvbSAnYXhpb3MnXHJcbmltcG9ydCBFdmVudEFnZ3JlZ2F0b3IgZnJvbSAnLi9wdWJzdWIvYWdncmVnYXRvcidcclxuaW1wb3J0IHsgSVBsYXlhYmxlIH0gZnJvbSAnLi4vdHlwZXMnXHJcblxyXG5jbGFzcyBTcG90aWZ5UGxheWJhY2sge1xyXG4gIHByaXZhdGUgcGxheWVyOiBhbnk7XHJcbiAgcHJpdmF0ZSBpc0V4ZWN1dGluZ0FjdGlvbjogYm9vbGVhbjtcclxuICBwcml2YXRlIGRldmljZV9pZDogc3RyaW5nO1xyXG4gIHNlbFBsYXlpbmc6IHtcclxuICAgICAgZWxlbWVudDogbnVsbCB8IEVsZW1lbnRcclxuICAgICAgdHJhY2tfdXJpOiBzdHJpbmdcclxuICAgICAgdHJhY2tEYXRhTm9kZTogbnVsbCB8IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT5cclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0U3RhdGVJbnRlcnZhbDogTm9kZUpTLlRpbWVvdXQgfCBudWxsO1xyXG5cclxuICBwcml2YXRlIHdlYlBsYXllckVsczoge1xyXG4gICAgdGl0bGU6IEVsZW1lbnQgfCBudWxsXHJcbiAgICBwcm9ncmVzczogRWxlbWVudCB8IG51bGxcclxuICAgIGN1cnJUaW1lOiBFbGVtZW50IHwgbnVsbFxyXG4gICAgZHVyYXRpb246IEVsZW1lbnQgfCBudWxsXHJcbiAgICBwbGF5UGF1c2U6IEVsZW1lbnQgfCBudWxsXHJcbiAgfTtcclxuXHJcbiAgcHJpdmF0ZSBwbGF5ZXJJc1JlYWR5OiBib29sZWFuO1xyXG5cclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICB0aGlzLmlzRXhlY3V0aW5nQWN0aW9uID0gZmFsc2VcclxuICAgIHRoaXMucGxheWVyID0gbnVsbFxyXG4gICAgdGhpcy5kZXZpY2VfaWQgPSAnJ1xyXG4gICAgdGhpcy5nZXRTdGF0ZUludGVydmFsID0gbnVsbFxyXG5cclxuICAgIHRoaXMud2ViUGxheWVyRWxzID0ge1xyXG4gICAgICB0aXRsZTogbnVsbCxcclxuICAgICAgcHJvZ3Jlc3M6IG51bGwsXHJcbiAgICAgIGN1cnJUaW1lOiBudWxsLFxyXG4gICAgICBkdXJhdGlvbjogbnVsbCxcclxuICAgICAgcGxheVBhdXNlOiBudWxsXHJcbiAgICB9XHJcbiAgICB0aGlzLnNlbFBsYXlpbmcgPSB7XHJcbiAgICAgIGVsZW1lbnQ6IG51bGwsXHJcbiAgICAgIHRyYWNrX3VyaTogJycsXHJcbiAgICAgIHRyYWNrRGF0YU5vZGU6IG51bGxcclxuICAgIH1cclxuICAgIHRoaXMucGxheWVySXNSZWFkeSA9IGZhbHNlXHJcbiAgICB0aGlzLl9sb2FkV2ViUGxheWVyKClcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgX2xvYWRXZWJQbGF5ZXIgKCkge1xyXG4gICAgcHJvbWlzZUhhbmRsZXI8QXhpb3NSZXNwb25zZTxzdHJpbmcgfCBudWxsPj4oYXhpb3MucmVxdWVzdDxzdHJpbmcgfCBudWxsPih7IG1ldGhvZDogJ0dFVCcsIHVybDogY29uZmlnLlVSTHMuZ2V0QWNjZXNzVG9rZW4gfSksIChyZXMpID0+IHtcclxuICAgICAgLy8gdGhpcyB0YWtlcyB0b28gbG9uZyBhbmQgc3BvdGlmeSBzZGsgbmVlZHMgd2luZG93Lm9uU3BvdGlmeVdlYlBsYXliYWNrU0RLUmVhZHkgdG8gYmUgZGVmaW5lZCBxdWlja2VyLlxyXG4gICAgICBjb25zdCBOT19DT05URU5UID0gMjA0XHJcbiAgICAgIGlmIChyZXMuc3RhdHVzID09PSBOT19DT05URU5UIHx8IHJlcy5kYXRhID09PSBudWxsKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdhY2Nlc3MgdG9rZW4gaGFzIG5vIGNvbnRlbnQnKVxyXG4gICAgICB9IGVsc2UgaWYgKHdpbmRvdy5TcG90aWZ5KSB7XHJcbiAgICAgICAgLy8gaWYgdGhlIHNwb3RpZnkgc2RrIGlzIGFscmVhZHkgZGVmaW5lZCBzZXQgcGxheWVyIHdpdGhvdXQgc2V0dGluZyBvblNwb3RpZnlXZWJQbGF5YmFja1NES1JlYWR5IG1lYW5pbmcgdGhlIHdpbmRvdzogV2luZG93IGlzIGluIGEgZGlmZmVyZW50IHNjb3BlXHJcbiAgICAgICAgLy8gdXNlIHdpbmRvdy5TcG90aWZ5LlBsYXllciBhcyBzcG90aWZ5IG5hbWVzcGFjZSBpcyBkZWNsYXJlZCBpbiB0aGUgV2luZG93IGludGVyZmFjZSBhcyBwZXIgRGVmaW5pdGVseVR5cGVkIC0+IHNwb3RpZnktd2ViLXBsYXliYWNrLXNkayAtPiBpbmRleC5kLnRzIGh0dHBzOi8vZ2l0aHViLmNvbS9EZWZpbml0ZWx5VHlwZWQvRGVmaW5pdGVseVR5cGVkL3RyZWUvbWFzdGVyL3R5cGVzL3Nwb3RpZnktd2ViLXBsYXliYWNrLXNka1xyXG4gICAgICAgIHRoaXMucGxheWVyID0gbmV3IHdpbmRvdy5TcG90aWZ5LlBsYXllcih7XHJcbiAgICAgICAgICBuYW1lOiAnU3BvdGlmeSBJbmZvIFdlYiBQbGF5ZXInLFxyXG4gICAgICAgICAgZ2V0T0F1dGhUb2tlbjogKGNiKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIGdpdmUgdGhlIHRva2VuIHRvIGNhbGxiYWNrXHJcbiAgICAgICAgICAgIGNiKHJlcy5kYXRhKVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHZvbHVtZTogMC40XHJcbiAgICAgICAgfSlcclxuICAgICAgICB0aGlzLl9hZGRMaXN0ZW5lcnMoKVxyXG4gICAgICAgIC8vIENvbm5lY3QgdG8gdGhlIHBsYXllciFcclxuICAgICAgICB0aGlzLnBsYXllci5jb25uZWN0KClcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBvZiBzcG90aWZ5IHNkayBpcyB1bmRlZmluZWRcclxuICAgICAgICB3aW5kb3cub25TcG90aWZ5V2ViUGxheWJhY2tTREtSZWFkeSA9ICgpID0+IHtcclxuICAgICAgICAgIC8vIGlmIGdldHRpbmcgdG9rZW4gd2FzIHN1Y2Nlc2Z1bCBjcmVhdGUgc3BvdGlmeSBwbGF5ZXIgdXNpbmcgdGhlIHdpbmRvdyBpbiB0aGlzIHNjb3BlXHJcbiAgICAgICAgICB0aGlzLnBsYXllciA9IG5ldyB3aW5kb3cuU3BvdGlmeS5QbGF5ZXIoe1xyXG4gICAgICAgICAgICBuYW1lOiAnU3BvdGlmeSBJbmZvIFdlYiBQbGF5ZXInLFxyXG4gICAgICAgICAgICBnZXRPQXV0aFRva2VuOiAoY2IpID0+IHtcclxuICAgICAgICAgICAgICAvLyBnaXZlIHRoZSB0b2tlbiB0byBjYWxsYmFja1xyXG4gICAgICAgICAgICAgIGNiKHJlcy5kYXRhKVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB2b2x1bWU6IDAuMVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIHRoaXMuX2FkZExpc3RlbmVycygpXHJcbiAgICAgICAgICAvLyBDb25uZWN0IHRvIHRoZSBwbGF5ZXIhXHJcbiAgICAgICAgICB0aGlzLnBsYXllci5jb25uZWN0KClcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9hZGRMaXN0ZW5lcnMgKCkge1xyXG4gICAgLy8gRXJyb3IgaGFuZGxpbmdcclxuICAgIHRoaXMucGxheWVyLmFkZExpc3RlbmVyKCdpbml0aWFsaXphdGlvbl9lcnJvcicsICh7IG1lc3NhZ2UgfTogeyBtZXNzYWdlOiB1bmtub3duIH0pID0+IHtcclxuICAgICAgY29uc29sZS5lcnJvcihtZXNzYWdlKVxyXG4gICAgfSlcclxuICAgIHRoaXMucGxheWVyLmFkZExpc3RlbmVyKCdhdXRoZW50aWNhdGlvbl9lcnJvcicsICh7IG1lc3NhZ2UgfTogeyBtZXNzYWdlOiB1bmtub3duIH0pID0+IHtcclxuICAgICAgY29uc29sZS5lcnJvcihtZXNzYWdlKVxyXG4gICAgICBjb25zb2xlLmxvZygncGxheWJhY2sgY291bGRudCBzdGFydCcpXHJcbiAgICB9KVxyXG4gICAgdGhpcy5wbGF5ZXIuYWRkTGlzdGVuZXIoJ2FjY291bnRfZXJyb3InLCAoeyBtZXNzYWdlIH06IHsgbWVzc2FnZTogdW5rbm93biB9KSA9PiB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSlcclxuICAgIH0pXHJcbiAgICB0aGlzLnBsYXllci5hZGRMaXN0ZW5lcigncGxheWJhY2tfZXJyb3InLCAoeyBtZXNzYWdlIH06IHsgbWVzc2FnZTogdW5rbm93biB9KSA9PiB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSlcclxuICAgIH0pXHJcblxyXG4gICAgLy8gUGxheWJhY2sgc3RhdHVzIHVwZGF0ZXNcclxuICAgIHRoaXMucGxheWVyLmFkZExpc3RlbmVyKCdwbGF5ZXJfc3RhdGVfY2hhbmdlZCcsIChzdGF0ZTogU3BvdGlmeS5QbGF5YmFja1N0YXRlIHwgbnVsbCkgPT4ge30pXHJcblxyXG4gICAgLy8gUmVhZHlcclxuICAgIHRoaXMucGxheWVyLmFkZExpc3RlbmVyKCdyZWFkeScsICh7IGRldmljZV9pZCB9OiB7IGRldmljZV9pZDogc3RyaW5nIH0pID0+IHtcclxuICAgICAgY29uc29sZS5sb2coJ1JlYWR5IHdpdGggRGV2aWNlIElEJywgZGV2aWNlX2lkKVxyXG4gICAgICB0aGlzLmRldmljZV9pZCA9IGRldmljZV9pZFxyXG4gICAgICB0aGlzLmFwcGVuZFdlYlBsYXllckh0bWwoKVxyXG4gICAgICB0aGlzLnBsYXllcklzUmVhZHkgPSB0cnVlXHJcbiAgICB9KVxyXG5cclxuICAgIC8vIE5vdCBSZWFkeVxyXG4gICAgdGhpcy5wbGF5ZXIuYWRkTGlzdGVuZXIoJ25vdF9yZWFkeScsICh7IGRldmljZV9pZCB9OiB7IGRldmljZV9pZDogc3RyaW5nIH0pID0+IHtcclxuICAgICAgY29uc29sZS5sb2coJ0RldmljZSBJRCBoYXMgZ29uZSBvZmZsaW5lJywgZGV2aWNlX2lkKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0V2ViUGxheWVyRWxzICgpIHtcclxuICAgIGNvbnN0IHdlYlBsYXllckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMud2ViUGxheWVyKSA/PyB0aHJvd0V4cHJlc3Npb24oJ3dlYiBwbGF5ZXIgZWxlbWVudCBkb2VzIG5vdCBleGlzdCcpXHJcbiAgICBjb25zdCBwbGF5VGltZUJhciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLnBsYXlUaW1lQmFyKSA/PyB0aHJvd0V4cHJlc3Npb24oJ3BsYXkgdGltZSBiYXIgZWxlbWVudCBkb2VzIG5vdCBleGlzdCcpXHJcblxyXG4gICAgdGhpcy53ZWJQbGF5ZXJFbHMucHJvZ3Jlc3MgPSB3ZWJQbGF5ZXJFbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFxyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMucHJvZ3Jlc3NcclxuICAgIClbMF0gYXMgRWxlbWVudCA/PyB0aHJvd0V4cHJlc3Npb24oJ3dlYiBwbGF5ZXIgcHJvZ3Jlc3MgYmFyIGRvZXMgbm90IGV4aXN0JylcclxuICAgIHRoaXMud2ViUGxheWVyRWxzLnRpdGxlID0gd2ViUGxheWVyRWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2g0JylbMF0gYXMgRWxlbWVudCA/PyB0aHJvd0V4cHJlc3Npb24oJ3dlYiBwbGF5ZXIgdGl0bGUgZWxlbWVudCBkb2VzIG5vdCBleGlzdCcpXHJcblxyXG4gICAgLy8gZ2V0IHBsYXl0aW1lIGJhciBlbGVtZW50c1xyXG4gICAgdGhpcy53ZWJQbGF5ZXJFbHMuY3VyclRpbWUgPSBwbGF5VGltZUJhci5nZXRFbGVtZW50c0J5VGFnTmFtZSgncCcpWzBdIGFzIEVsZW1lbnQgPz8gdGhyb3dFeHByZXNzaW9uKCd3ZWIgcGxheWVyIGN1cnJlbnQgdGltZSBlbGVtZW50IGRvZXMgbm90IGV4aXN0JylcclxuICAgIHRoaXMud2ViUGxheWVyRWxzLmR1cmF0aW9uID0gcGxheVRpbWVCYXIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3AnKVsxXSBhcyBFbGVtZW50ID8/IHRocm93RXhwcmVzc2lvbignd2ViIHBsYXllciBkdXJhdGlvbiB0aW1lIGVsZW1lbnQgZG9lcyBub3QgZXhpc3QnKVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhcHBlbmRXZWJQbGF5ZXJIdG1sICgpIHtcclxuICAgIGNvbnN0IGh0bWwgPSBgXHJcbiAgICA8YXJ0aWNsZSBpZD1cIiR7Y29uZmlnLkNTUy5JRHMud2ViUGxheWVyfVwiIGNsYXNzPVwicmVzaXplLWRyYWdcIj5cclxuICAgICAgPGg0IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfVwiPlRpdGxlPC9oND5cclxuICAgICAgPGRpdj5cclxuICAgICAgICA8YnV0dG9uIGlkPVwiJHtjb25maWcuQ1NTLklEcy5wbGF5UHJldn1cIj48aW1nIHNyYz1cIiR7Y29uZmlnLlBBVEhTLnBsYXlQcmV2fVwiIGFsdD1cInByZXZpb3VzXCIvPjwvYnV0dG9uPlxyXG4gICAgICAgIDxidXR0b24gaWQ9XCIke2NvbmZpZy5DU1MuSURzLndlYlBsYXllclBsYXlQYXVzZX1cIj48aW1nIHNyYz1cIiR7Y29uZmlnLlBBVEhTLnBsYXlCbGFja0ljb259XCIgYWx0PVwicGxheS9wYXVzZVwiLz48L2J1dHRvbj5cclxuICAgICAgICA8YnV0dG9uIGlkPVwiJHtjb25maWcuQ1NTLklEcy5wbGF5TmV4dH1cIj48aW1nIHNyYz1cIiR7Y29uZmlnLlBBVEhTLnBsYXlOZXh0fVwiIGFsdD1cIm5leHRcIi8+PC9idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICA8ZGl2IGlkPVwiJHtjb25maWcuQ1NTLklEcy5wbGF5VGltZUJhcn1cIj5cclxuICAgICAgICA8cD4wOjAwPC9wPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5wcm9ncmVzc0Jhcn1cIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5wcm9ncmVzc31cIj48L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8cD4wOjAwPC9wPlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvYXJ0aWNsZT5cclxuICAgIGBcclxuXHJcbiAgICBjb25zdCB3ZWJQbGF5ZXJFbCA9IGh0bWxUb0VsKGh0bWwpXHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZCh3ZWJQbGF5ZXJFbCBhcyBOb2RlKVxyXG4gICAgdGhpcy5hc3NpZ25FdmVudExpc3RlbmVycygpXHJcbiAgICB0aGlzLmdldFdlYlBsYXllckVscygpXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzc2lnbkV2ZW50TGlzdGVuZXJzICgpIHtcclxuICAgIGNvbnN0IHBsYXlQcmV2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMucGxheVByZXYpXHJcbiAgICBjb25zdCBwbGF5UGF1c2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy53ZWJQbGF5ZXJQbGF5UGF1c2UpXHJcbiAgICBjb25zdCBwbGF5TmV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5DU1MuSURzLnBsYXlOZXh0KVxyXG5cclxuICAgIHRoaXMud2ViUGxheWVyRWxzLnBsYXlQYXVzZSA9IHBsYXlQYXVzZVxyXG5cclxuICAgIHBsYXlQcmV2Py5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMudHJ5UGxheVByZXYodGhpcy5zZWxQbGF5aW5nLnRyYWNrRGF0YU5vZGUpKVxyXG4gICAgcGxheVBhdXNlPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMudHJ5V2ViUGxheWVyUGF1c2UodGhpcy5zZWxQbGF5aW5nLnRyYWNrRGF0YU5vZGUpKVxyXG4gICAgcGxheU5leHQ/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy50cnlQbGF5TmV4dCh0aGlzLnNlbFBsYXlpbmcudHJhY2tEYXRhTm9kZSkpXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHVwZGF0ZVdlYlBsYXllciAocGVyY2VudERvbmU6IG51bWJlciwgcG9zaXRpb246IG51bWJlcikge1xyXG4gICAgaWYgKHBvc2l0aW9uICE9PSAwKSB7XHJcbiAgICAgICh0aGlzLndlYlBsYXllckVscy5wcm9ncmVzcyBhcyBIVE1MRWxlbWVudCkuc3R5bGUud2lkdGggPSBgJHtwZXJjZW50RG9uZX0lYFxyXG4gICAgICBpZiAodGhpcy53ZWJQbGF5ZXJFbHMuY3VyclRpbWUgPT0gbnVsbCkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ3VycmVudCB0aW1lIGVsZW1lbnQgaXMgbnVsbCcpXHJcbiAgICAgIH1cclxuICAgICAgdGhpcy53ZWJQbGF5ZXJFbHMuY3VyclRpbWUudGV4dENvbnRlbnQgPVxyXG4gICAgICAgIG1pbGxpc1RvTWludXRlc0FuZFNlY29uZHMocG9zaXRpb24pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogVHJpZXMgdG8gcGF1c2UgdGhlIGN1cnJlbnQgcGxheWluZyBJUGxheWFibGUgbm9kZSBmcm9tIHRoZSB3ZWIgcGxheWVyLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGN1cnJOb2RlIC0gdGhlIGN1cnJlbnQgSVBsYXlhYmxlIG5vZGUgdGhhdCB3YXMvaXMgcGxheWluZ1xyXG4gICAqL1xyXG4gIHByaXZhdGUgdHJ5V2ViUGxheWVyUGF1c2UgKGN1cnJOb2RlOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+IHwgbnVsbCkge1xyXG4gICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoaXMgaXMgdGhlIGZpcnN0IG5vZGUgb3IgaWYgYW4gYWN0aW9uIGlzIHByb2Nlc3NpbmdcclxuICAgIGlmICghdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiAmJiBjdXJyTm9kZSAhPT0gbnVsbCkge1xyXG4gICAgICBjb25zdCBwcmV2VHJhY2sgPSBjdXJyTm9kZS5kYXRhXHJcbiAgICAgIHRoaXMuc2V0U2VsUGxheWluZ0VsKG5ldyBQbGF5YWJsZUV2ZW50QXJnKHByZXZUcmFjaywgY3Vyck5vZGUpKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFRyaWVzIHRvIHBsYXkgdGhlIHByZXZpb3VzIElQbGF5YWJsZSBnaXZlbiB0aGUgY3VycmVudCBwbGF5aW5nIElQbGF5YWJsZSBub2RlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGN1cnJOb2RlIC0gdGhlIGN1cnJlbnQgSVBsYXlhYmxlIG5vZGUgdGhhdCB3YXMvaXMgcGxheWluZ1xyXG4gICAqL1xyXG4gIHByaXZhdGUgdHJ5UGxheVByZXYgKGN1cnJOb2RlOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+IHwgbnVsbCkge1xyXG4gICAgaWYgKGN1cnJOb2RlID09PSBudWxsKSB7XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoaXMgaXMgdGhlIGZpcnN0IG5vZGUgb3IgaWYgYW4gYWN0aW9uIGlzIHByb2Nlc3NpbmdcclxuICAgIGlmICghdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiAmJiBjdXJyTm9kZS5wcmV2aW91cyAhPT0gbnVsbCkge1xyXG4gICAgICBjb25zdCBwcmV2VHJhY2sgPSBjdXJyTm9kZS5wcmV2aW91cy5kYXRhXHJcbiAgICAgIHRoaXMuc2V0U2VsUGxheWluZ0VsKG5ldyBQbGF5YWJsZUV2ZW50QXJnKHByZXZUcmFjaywgY3Vyck5vZGUucHJldmlvdXMpKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFRyaWVzIHRvIHBsYXkgdGhlIG5leHQgSVBsYXlhYmxlIGdpdmVuIHRoZSBjdXJyZW50IHBsYXlpbmcgSVBsYXlhYmxlIG5vZGUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gY3Vyck5vZGUgLSB0aGUgY3VycmVudCBJUGxheWFibGUgbm9kZSB0aGF0IHdhcy9pcyBwbGF5aW5nXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB0cnlQbGF5TmV4dCAoY3Vyck5vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4gfCBudWxsKSB7XHJcbiAgICBpZiAoY3Vyck5vZGUgPT09IG51bGwpIHtcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICAvLyBjaGVjayB0byBzZWUgaWYgdGhpcyBpcyB0aGUgbGFzdCBub2RlIG9yIGlmIGFuIGFjdGlvbiBpcyBwcm9jZXNzaW5nXHJcbiAgICBpZiAoIXRoaXMuaXNFeGVjdXRpbmdBY3Rpb24gJiYgY3Vyck5vZGUubmV4dCAhPT0gbnVsbCkge1xyXG4gICAgICBjb25zdCBuZXh0VHJhY2sgPSBjdXJyTm9kZS5uZXh0LmRhdGFcclxuICAgICAgdGhpcy5zZXRTZWxQbGF5aW5nRWwobmV3IFBsYXlhYmxlRXZlbnRBcmcobmV4dFRyYWNrLCBjdXJyTm9kZS5uZXh0KSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgY29tcGxldGVseURlc2VsZWN0VHJhY2sgKCkge1xyXG4gICAgaWYgKHRoaXMuc2VsUGxheWluZy5lbGVtZW50ID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignU2VsZWN0ZWQgcGxheWluZyBlbGVtZW50IHdhcyBudWxsIGJlZm9yZSBkZXNlbGVjdGlvbiBvbiBzb25nIGZpbmlzaCcpXHJcbiAgICB9XHJcbiAgICB0aGlzLnBhdXNlRGVzZWxlY3RUcmFjaygpXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcudHJhY2tfdXJpID0gJydcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcGF1c2VEZXNlbGVjdFRyYWNrICgpIHtcclxuICAgIGlmICh0aGlzLnNlbFBsYXlpbmcuZWxlbWVudCA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlbGVjdGVkIHBsYXlpbmcgZWxlbWVudCB3YXMgbnVsbCBiZWZvcmUgZGVzZWxlY3Rpb24gb24gc29uZyBmaW5pc2gnKVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2VsUGxheWluZy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgdGhpcy53ZWJQbGF5ZXJFbHMucGxheVBhdXNlPy5jbGFzc0xpc3QucmVtb3ZlKGNvbmZpZy5DU1MuQ0xBU1NFUy5zZWxlY3RlZClcclxuICAgIHRoaXMuc2VsUGxheWluZy5lbGVtZW50ID0gbnVsbFxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzZWxlY3RUcmFjayAoZXZlbnRBcmc6IFBsYXlhYmxlRXZlbnRBcmcpIHtcclxuICAgIHRoaXMuc2VsUGxheWluZy50cmFja0RhdGFOb2RlID0gZXZlbnRBcmcucGxheWFibGVOb2RlXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcuZWxlbWVudCA9IGV2ZW50QXJnLmN1cnJQbGF5YWJsZS5zZWxFbFxyXG4gICAgdGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICB0aGlzLnNlbFBsYXlpbmcudHJhY2tfdXJpID0gZXZlbnRBcmcuY3VyclBsYXlhYmxlLnVyaVxyXG5cclxuICAgIHRoaXMud2ViUGxheWVyRWxzLnBsYXlQYXVzZT8uY2xhc3NMaXN0LmFkZChjb25maWcuQ1NTLkNMQVNTRVMuc2VsZWN0ZWQpXHJcbiAgICB0aGlzLndlYlBsYXllckVscyEudGl0bGUhLnRleHRDb250ZW50ID0gZXZlbnRBcmcuY3VyclBsYXlhYmxlLnRpdGxlXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uVHJhY2tGaW5pc2ggKCkge1xyXG4gICAgdGhpcy5jb21wbGV0ZWx5RGVzZWxlY3RUcmFjaygpO1xyXG5cclxuICAgICh0aGlzLndlYlBsYXllckVscy5wcm9ncmVzcyBhcyBIVE1MRWxlbWVudCkuc3R5bGUud2lkdGggPSAnMTAwJSdcclxuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5nZXRTdGF0ZUludGVydmFsIGFzIE5vZGVKUy5UaW1lb3V0KVxyXG4gICAgdGhpcy50cnlQbGF5TmV4dCh0aGlzLnNlbFBsYXlpbmcudHJhY2tEYXRhTm9kZSlcclxuICB9XHJcblxyXG4gIC8qKiBTZXRzIGFuIGludGVydmFsIHRoYXQgb2J0YWlucyB0aGUgc3RhdGUgb2YgdGhlIHBsYXllciBldmVyeSBzZWNvbmQuXHJcbiAgICogU2hvdWxkIG9ubHkgYmUgY2FsbGVkIHdoZW4gYSBzb25nIGlzIHBsYXlpbmcuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzZXRHZXRTdGF0ZUludGVydmFsICgpIHtcclxuICAgIGxldCBkdXJhdGlvbk1pblNlYyA9ICcnXHJcbiAgICBpZiAodGhpcy5nZXRTdGF0ZUludGVydmFsKSB7XHJcbiAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5nZXRTdGF0ZUludGVydmFsKVxyXG4gICAgfVxyXG4gICAgLy8gc2V0IHRoZSBpbnRlcnZhbCB0byBydW4gZXZlcnkgc2Vjb25kIGFuZCBvYnRhaW4gdGhlIHN0YXRlXHJcbiAgICB0aGlzLmdldFN0YXRlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgIHRoaXMucGxheWVyLmdldEN1cnJlbnRTdGF0ZSgpLnRoZW4oKHN0YXRlOiB7IHBvc2l0aW9uOiBhbnk7IGR1cmF0aW9uOiBhbnkgfSkgPT4ge1xyXG4gICAgICAgIGlmICghc3RhdGUpIHtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXHJcbiAgICAgICAgICAgICdVc2VyIGlzIG5vdCBwbGF5aW5nIG11c2ljIHRocm91Z2ggdGhlIFdlYiBQbGF5YmFjayBTREsnXHJcbiAgICAgICAgICApXHJcbiAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgeyBwb3NpdGlvbiwgZHVyYXRpb24gfSA9IHN0YXRlXHJcblxyXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzbnQgYSBkdXJhdGlvbiBzZXQgZm9yIHRoaXMgc29uZyBzZXQgaXQuXHJcbiAgICAgICAgaWYgKGR1cmF0aW9uTWluU2VjID09PSAnJykge1xyXG4gICAgICAgICAgZHVyYXRpb25NaW5TZWMgPSBtaWxsaXNUb01pbnV0ZXNBbmRTZWNvbmRzKGR1cmF0aW9uKVxyXG4gICAgICAgICAgdGhpcy53ZWJQbGF5ZXJFbHMhLmR1cmF0aW9uIS50ZXh0Q29udGVudCA9IGR1cmF0aW9uTWluU2VjXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBwZXJjZW50RG9uZSA9IChwb3NpdGlvbiAvIGR1cmF0aW9uKSAqIDEwMFxyXG5cclxuICAgICAgICAvLyB0aGUgcG9zaXRpb24gZ2V0cyBzZXQgdG8gMCB3aGVuIHRoZSBzb25nIGlzIGZpbmlzaGVkXHJcbiAgICAgICAgaWYgKHBvc2l0aW9uID09PSAwKSB7XHJcbiAgICAgICAgICB0aGlzLm9uVHJhY2tGaW5pc2goKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyBpZiB0aGUgcG9zaXRpb24gaXNudCAwIHVwZGF0ZSB0aGUgd2ViIHBsYXllciBlbGVtZW50c1xyXG4gICAgICAgICAgdGhpcy51cGRhdGVXZWJQbGF5ZXIocGVyY2VudERvbmUsIHBvc2l0aW9uKVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgIH0sIDEwMDApXHJcbiAgfVxyXG5cclxuICAvKiogU2VsZWN0IGEgY2VydGFpbiBwbGF5L3BhdXNlIGVsZW1lbnQgYW5kIHBsYXkgdGhlIGdpdmVuIHRyYWNrIHVyaVxyXG4gICAqIGFuZCB1bnNlbGVjdCB0aGUgcHJldmlvdXMgb25lIHRoZW4gcGF1c2UgdGhlIHByZXZpb3VzIHRyYWNrX3VyaS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7UGxheWFibGVFdmVudEFyZ30gZXZlbnRBcmcgLSBhIGNsYXNzIHRoYXQgY29udGFpbnMgdGhlIGN1cnJlbnQsIG5leHQgYW5kIHByZXZpb3VzIHRyYWNrcyB0byBwbGF5XHJcbiAgICovXHJcbiAgcHVibGljIGFzeW5jIHNldFNlbFBsYXlpbmdFbCAoZXZlbnRBcmc6IFBsYXlhYmxlRXZlbnRBcmcpIHtcclxuICAgIC8vIGlmIHRoZSBwbGF5ZXIgaXNuJ3QgcmVhZHkgd2UgY2Fubm90IGNvbnRpbnVlLlxyXG4gICAgaWYgKCF0aGlzLnBsYXllcklzUmVhZHkpIHtcclxuICAgICAgY29uc29sZS5sb2coJ3BsYXllciBpcyBub3QgcmVhZHknKVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIGlmICh0aGlzLmlzRXhlY3V0aW5nQWN0aW9uKSB7XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgdGhpcy5pc0V4ZWN1dGluZ0FjdGlvbiA9IHRydWVcclxuICAgIGlmICh0aGlzLnNlbFBsYXlpbmcuZWxlbWVudCAhPSBudWxsKSB7XHJcbiAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5nZXRTdGF0ZUludGVydmFsIGFzIE5vZGVKUy5UaW1lb3V0KVxyXG5cclxuICAgICAgLy8gaWYgaXRzIHRoZSBzYW1lIGVsZW1lbnQgdGhlbiBwYXVzZVxyXG4gICAgICBpZiAodGhpcy5zZWxQbGF5aW5nLmVsZW1lbnQgPT09IGV2ZW50QXJnLmN1cnJQbGF5YWJsZS5zZWxFbCkge1xyXG4gICAgICAgIHRoaXMucGF1c2VEZXNlbGVjdFRyYWNrKClcclxuICAgICAgICBhd2FpdCB0aGlzLnBhdXNlKClcclxuICAgICAgICB0aGlzLmlzRXhlY3V0aW5nQWN0aW9uID0gZmFsc2VcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBvdGhlcndpc2UgY29tcGxldGVseSBkZXNlbGVjdCB0aGUgY3VycmVudCB0cmFjayBiZWZvcmUgc2VsZWN0aW5nIGFub3RoZXIgb25lIHRvIHBsYXlcclxuICAgICAgICB0aGlzLmNvbXBsZXRlbHlEZXNlbGVjdFRyYWNrKClcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHByZXYgdHJhY2sgdXJpIGlzIHRoZSBzYW1lIHRoZW4gcmVzdW1lIHRoZSBzb25nIGluc3RlYWQgb2YgcmVwbGF5aW5nIGl0LlxyXG4gICAgaWYgKHRoaXMuc2VsUGxheWluZy50cmFja191cmkgPT09IGV2ZW50QXJnLmN1cnJQbGF5YWJsZS51cmkpIHtcclxuICAgICAgYXdhaXQgdGhpcy5zdGFydFRyYWNrKGFzeW5jICgpID0+IHRoaXMucmVzdW1lKCksIGV2ZW50QXJnKVxyXG4gICAgICB0aGlzLmlzRXhlY3V0aW5nQWN0aW9uID0gZmFsc2VcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgYXdhaXQgdGhpcy5zdGFydFRyYWNrKGFzeW5jICgpID0+IHRoaXMucGxheShldmVudEFyZy5jdXJyUGxheWFibGUudXJpKSwgZXZlbnRBcmcpXHJcbiAgICB0aGlzLmlzRXhlY3V0aW5nQWN0aW9uID0gZmFsc2VcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgc3RhcnRUcmFjayAocGxheWluZ0FzeW5jRnVuYzogRnVuY3Rpb24sIGV2ZW50QXJnOiBQbGF5YWJsZUV2ZW50QXJnKSB7XHJcbiAgICB0aGlzLnNlbGVjdFRyYWNrKGV2ZW50QXJnKVxyXG5cclxuICAgIGF3YWl0IHBsYXlpbmdBc3luY0Z1bmMoKVxyXG5cclxuICAgIC8vIHNldCBwbGF5aW5nIHN0YXRlIG9uY2Ugc29uZyBzdGFydHMgcGxheWluZ1xyXG4gICAgdGhpcy5zZXRHZXRTdGF0ZUludGVydmFsKClcclxuICB9XHJcblxyXG4gIC8qKiBQbGF5cyBhIHRyYWNrIHRocm91Z2ggdGhpcyBkZXZpY2UuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHJhY2tfdXJpIC0gdGhlIHRyYWNrIHVyaSB0byBwbGF5XHJcbiAgICogQHJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHRyYWNrIGhhcyBiZWVuIHBsYXllZCBzdWNjZXNmdWxseS5cclxuICAgKi9cclxuICBwcml2YXRlIGFzeW5jIHBsYXkgKHRyYWNrX3VyaTogc3RyaW5nKSB7XHJcbiAgICBhd2FpdCBwcm9taXNlSGFuZGxlcihcclxuICAgICAgYXhpb3MucHV0KGNvbmZpZy5VUkxzLnB1dFBsYXlUcmFjayh0aGlzLmRldmljZV9pZCwgdHJhY2tfdXJpKSlcclxuICAgIClcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgcmVzdW1lICgpIHtcclxuICAgIGF3YWl0IHRoaXMucGxheWVyLnJlc3VtZSgpXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzeW5jIHBhdXNlICgpIHtcclxuICAgIGF3YWl0IHRoaXMucGxheWVyLnBhdXNlKClcclxuICB9XHJcbn1cclxuXHJcbmNvbnN0IHNwb3RpZnlQbGF5YmFjayA9IG5ldyBTcG90aWZ5UGxheWJhY2soKVxyXG5cclxuaWYgKCh3aW5kb3cgYXMgYW55KS5ldmVudEFnZ3JlZ2F0b3IgPT09IHVuZGVmaW5lZCkge1xyXG4gIC8vIGNyZWF0ZSBhIGdsb2JhbCB2YXJpYWJsZSB0byBiZSB1c2VkXHJcbiAgKHdpbmRvdyBhcyBhbnkpLmV2ZW50QWdncmVnYXRvciA9IG5ldyBFdmVudEFnZ3JlZ2F0b3IoKVxyXG59XHJcbmNvbnN0IGV2ZW50QWdncmVnYXRvciA9ICh3aW5kb3cgYXMgYW55KS5ldmVudEFnZ3JlZ2F0b3IgYXMgRXZlbnRBZ2dyZWdhdG9yXHJcblxyXG4vLyBzdWJzY3JpYmUgdGhlIHNldFBsYXlpbmcgZWxlbWVudCBldmVudFxyXG5ldmVudEFnZ3JlZ2F0b3Iuc3Vic2NyaWJlKFBsYXlhYmxlRXZlbnRBcmcubmFtZSwgKGV2ZW50QXJnOiBQbGF5YWJsZUV2ZW50QXJnKSA9PlxyXG4gIHNwb3RpZnlQbGF5YmFjay5zZXRTZWxQbGF5aW5nRWwoZXZlbnRBcmcpXHJcbilcclxuYWRkUmVzaXplRHJhZygpXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNTYW1lUGxheWluZ1VSSSAodXJpOiBzdHJpbmcpIHtcclxuICByZXR1cm4gKFxyXG4gICAgdXJpID09PSBzcG90aWZ5UGxheWJhY2suc2VsUGxheWluZy50cmFja191cmkgJiZcclxuICAgICAgc3BvdGlmeVBsYXliYWNrLnNlbFBsYXlpbmcuZWxlbWVudCAhPSBudWxsXHJcbiAgKVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tJZklzUGxheWluZ0VsQWZ0ZXJSZXJlbmRlciAodXJpOiBzdHJpbmcsIHNlbEVsOiBFbGVtZW50LCB0cmFja0RhdGFOb2RlOiBEb3VibHlMaW5rZWRMaXN0Tm9kZTxJUGxheWFibGU+KSB7XHJcbiAgaWYgKGlzU2FtZVBsYXlpbmdVUkkodXJpKSkge1xyXG4gICAgLy8gVGhpcyBlbGVtZW50IHdhcyBwbGF5aW5nIGJlZm9yZSByZXJlbmRlcmluZyBzbyBzZXQgaXQgdG8gYmUgdGhlIGN1cnJlbnRseSBwbGF5aW5nIG9uZSBhZ2FpblxyXG4gICAgc3BvdGlmeVBsYXliYWNrLnNlbFBsYXlpbmcuZWxlbWVudCA9IHNlbEVsXHJcbiAgICBzcG90aWZ5UGxheWJhY2suc2VsUGxheWluZy50cmFja0RhdGFOb2RlID0gdHJhY2tEYXRhTm9kZVxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgU3Vic2NyaXB0aW9uIGZyb20gJy4vc3Vic2NyaXB0aW9uJ1xyXG5cclxuLyoqIExldHMgc2F5IHlvdSBoYXZlIHR3byBkb29ycyB0aGF0IHdpbGwgb3BlbiB0aHJvdWdoIHRoZSBwdWIgc3ViIHN5c3RlbS4gV2hhdCB3aWxsIGhhcHBlbiBpcyB0aGF0IHdlIHdpbGwgc3Vic2NyaWJlIG9uZVxyXG4gKiBvbiBkb29yIG9wZW4gZXZlbnQuIFdlIHdpbGwgdGhlbiBoYXZlIHR3byBwdWJsaXNoZXJzIHRoYXQgd2lsbCBlYWNoIHByb3BhZ2F0ZSBhIGRpZmZlcmVudCBkb29yIHRocm91Z2ggdGhlIGFnZ3JlZ2F0b3IgYXQgZGlmZmVyZW50IHBvaW50cy5cclxuICogVGhlIGFnZ3JlZ2F0b3Igd2lsbCB0aGVuIGV4ZWN1dGUgdGhlIG9uIGRvb3Igb3BlbiBzdWJzY3JpYmVyIGFuZCBwYXNzIGluIHRoZSBkb29yIGdpdmVuIGJ5IGVpdGhlciBwdWJsaXNoZXIuXHJcbiAqL1xyXG5cclxuLyoqIE1hbmFnZXMgc3Vic2NyaWJpbmcgYW5kIHB1Ymxpc2hpbmcgb2YgZXZlbnRzLlxyXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAqIEFuIGFyZ1R5cGUgaXMgb2J0YWluZWQgYnkgdGFraW5nIHRoZSAnQ2xhc3NJbnN0YW5jZScuY29udHJ1Y3Rvci5uYW1lIG9yICdDbGFzcycubmFtZS5cclxuICogU3Vic2NyaXB0aW9ucyBhcmUgZ3JvdXBlZCB0b2dldGhlciBieSBhcmdUeXBlIGFuZCB0aGVpciBldnQgdGFrZXMgYW4gYXJndW1lbnQgdGhhdCBpcyBhXHJcbiAqIGNsYXNzIHdpdGggdGhlIGNvbnN0cnVjdG9yLm5hbWUgb2YgYXJnVHlwZS5cclxuICpcclxuICovXHJcbmNsYXNzIEV2ZW50QWdncmVnYXRvciB7XHJcbiAgc3Vic2NyaWJlcnM6IHsgW2tleTogc3RyaW5nXTogQXJyYXk8U3Vic2NyaXB0aW9uPiB9O1xyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIC8vIGtleSAtIHR5cGUsIHZhbHVlIC0gW10gb2YgZnVuY3Rpb25zIHRoYXQgdGFrZSBhIGNlcnRhaW4gdmFsdWUgZGVwZW5kaW5nIG9uIHRoZSB0eXBlXHJcbiAgICB0aGlzLnN1YnNjcmliZXJzID0ge31cclxuICB9XHJcblxyXG4gIC8qKiBTdWJzY3JpYmVzIGEgdHlwZSBvZiBldmVudC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBhcmdUeXBlIC0gdGhlIHR5cGUgdGhhdCB0aGlzIHN1YnNjcmliZXIgYmVsb25ncyB0b28uXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZXZlbnQgLSB0aGUgZXZlbnQgdGhhdCB0YWtlcyB0aGUgc2FtZSBhcmdzIGFzIGFsbCBvdGhlciBldmVudHMgb2YgdGhlIGdpdmVuIHR5cGUuXHJcbiAgICovXHJcbiAgc3Vic2NyaWJlIChhcmdUeXBlOiBzdHJpbmcsIGV2dDogRnVuY3Rpb24pIHtcclxuICAgIGNvbnN0IHN1YnNjcmliZXIgPSBuZXcgU3Vic2NyaXB0aW9uKHRoaXMsIGV2dCwgYXJnVHlwZSlcclxuXHJcbiAgICBpZiAoYXJnVHlwZSBpbiB0aGlzLnN1YnNjcmliZXJzKSB7XHJcbiAgICAgIHRoaXMuc3Vic2NyaWJlcnNbYXJnVHlwZV0ucHVzaChzdWJzY3JpYmVyKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5zdWJzY3JpYmVyc1thcmdUeXBlXSA9IFtzdWJzY3JpYmVyXVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFVuc3Vic2NyaWJlcyBhIGdpdmVuIHN1YnNjcmlwdGlvbi5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U3Vic2NyaXB0aW9ufSBzdWJzY3JpcHRpb25cclxuICAgKi9cclxuICB1bnN1YnNjcmliZSAoc3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb24pIHtcclxuICAgIGlmIChzdWJzY3JpcHRpb24uYXJnVHlwZSBpbiB0aGlzLnN1YnNjcmliZXJzKSB7XHJcbiAgICAgIC8vIGZpbHRlciBvdXQgdGhlIHN1YnNjcmlwdGlvbiBnaXZlbiBmcm9tIHRoZSBzdWJzY3JpYmVycyBkaWN0aW9uYXJ5XHJcbiAgICAgIGNvbnN0IGZpbHRlcmVkID0gdGhpcy5zdWJzY3JpYmVyc1tzdWJzY3JpcHRpb24uYXJnVHlwZV0uZmlsdGVyKGZ1bmN0aW9uIChzdWIpIHtcclxuICAgICAgICByZXR1cm4gc3ViLmlkICE9PSBzdWJzY3JpcHRpb24uaWRcclxuICAgICAgfSlcclxuXHJcbiAgICAgIHRoaXMuc3Vic2NyaWJlcnNbc3Vic2NyaXB0aW9uLmFyZ1R5cGVdID0gZmlsdGVyZWRcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBQdWJsaXNoZXMgYWxsIHN1YnNjcmliZXJzIHRoYXQgdGFrZSBhcmd1bWVudHMgb2YgYSBnaXZlbiB0eXBlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGFyZ3MgLSBhIGNsYXNzIHRoYXQgY29udGFpbnMgYXJndW1lbnRzIGZvciB0aGUgZXZlbnQuIE11c3QgYmUgYSBjbGFzcyBhcyBzdWJzY3JpYmVycyBhcmUgZ3JvdXBlZCBieSB0eXBlLlxyXG4gICAqL1xyXG4gIHB1Ymxpc2ggKGFyZ3M6IE9iamVjdCkge1xyXG4gICAgY29uc3QgYXJnVHlwZSA9IGFyZ3MuY29uc3RydWN0b3IubmFtZVxyXG5cclxuICAgIGlmIChhcmdUeXBlIGluIHRoaXMuc3Vic2NyaWJlcnMpIHtcclxuICAgICAgdGhpcy5zdWJzY3JpYmVyc1thcmdUeXBlXS5mb3JFYWNoKChzdWJzY3JpcHRpb24pID0+IHtcclxuICAgICAgICBzdWJzY3JpcHRpb24uZXZ0KGFyZ3MpXHJcbiAgICAgIH0pXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdubyB0eXBlIGZvdW5kIGZvciBwdWJsaXNoaW5nJylcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNsZWFyU3Vic2NyaXB0aW9ucyAoKSB7XHJcbiAgICB0aGlzLnN1YnNjcmliZXJzID0ge31cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEV2ZW50QWdncmVnYXRvclxyXG4iLCJpbXBvcnQgeyBJUGxheWFibGUgfSBmcm9tICcuLi8uLi8uLi90eXBlcydcclxuaW1wb3J0IHsgRG91Ymx5TGlua2VkTGlzdE5vZGUgfSBmcm9tICcuLi8uLi9kb3VibHktbGlua2VkLWxpc3QnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5YWJsZUV2ZW50QXJnIHtcclxuICBjdXJyUGxheWFibGU6IElQbGF5YWJsZTtcclxuICBwbGF5YWJsZU5vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT5cclxuXHJcbiAgLyoqIFRha2VzIGluIHRoZSBjdXJyZW50IHRyYWNrIHRvIHBsYXkgYXMgd2VsbCBhcyB0aGUgcHJldiB0cmFja3MgYW5kIG5leHQgdHJhY2tzIGZyb20gaXQuXHJcbiAgICogTm90ZSB0aGF0IGl0IGRvZXMgbm90IHRha2UgVHJhY2sgaW5zdGFuY2VzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtJUGxheWFibGV9IGN1cnJUcmFjayAtIG9iamVjdCBjb250YWluaW5nIGVsZW1lbnQgdG8gc2VsZWN0LCB0cmFja191cmksIGFuZCB0cmFjayB0aXRsZS5cclxuICAgKiBAcGFyYW0ge0RvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT59IHRyYWNrTm9kZSAtIG5vZGUgdGhhdCBhbGxvd3MgdXMgdG8gdHJhdmVyc2UgdG8gbmV4dCBhbmQgcHJldmlvdXMgdHJhY2sgZGF0YXMuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IgKGN1cnJUcmFjazogSVBsYXlhYmxlLCB0cmFja05vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4pIHtcclxuICAgIHRoaXMuY3VyclBsYXlhYmxlID0gY3VyclRyYWNrXHJcbiAgICB0aGlzLnBsYXlhYmxlTm9kZSA9IHRyYWNrTm9kZVxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgRXZlbnRBZ2dyZWdhdG9yIGZyb20gJy4vYWdncmVnYXRvcidcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN1YnNjcmlwdGlvbiB7XHJcbiAgZXZlbnRBZ2dyZWdhdG9yOiBFdmVudEFnZ3JlZ2F0b3I7XHJcbiAgZXZ0OiBGdW5jdGlvbjtcclxuICBhcmdUeXBlOiBzdHJpbmc7XHJcbiAgaWQ6IHN0cmluZztcclxuXHJcbiAgY29uc3RydWN0b3IgKGV2ZW50QWdncmVnYXRvcjogRXZlbnRBZ2dyZWdhdG9yLCBldnQ6IEZ1bmN0aW9uLCBhcmdUeXBlOiBzdHJpbmcpIHtcclxuICAgIHRoaXMuZXZlbnRBZ2dyZWdhdG9yID0gZXZlbnRBZ2dyZWdhdG9yXHJcbiAgICB0aGlzLmV2dCA9IGV2dFxyXG4gICAgdGhpcy5hcmdUeXBlID0gYXJnVHlwZVxyXG4gICAgdGhpcy5pZCA9IERhdGUubm93KCkudG9TdHJpbmcoMzYpICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIpXHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7XHJcbiAgY29uZmlnLFxyXG4gIG1pbGxpc1RvTWludXRlc0FuZFNlY29uZHMsXHJcbiAgaHRtbFRvRWwsXHJcbiAgZ2V0VmFsaWRJbWFnZVxyXG59IGZyb20gJy4uL2NvbmZpZydcclxuaW1wb3J0IHtcclxuICBjaGVja0lmSXNQbGF5aW5nRWxBZnRlclJlcmVuZGVyLFxyXG4gIGlzU2FtZVBsYXlpbmdVUklcclxufSBmcm9tICcuL3BsYXliYWNrLXNkaydcclxuaW1wb3J0IEFsYnVtIGZyb20gJy4vYWxidW0nXHJcbmltcG9ydCBDYXJkIGZyb20gJy4vY2FyZCdcclxuaW1wb3J0IFBsYXlhYmxlRXZlbnRBcmcgZnJvbSAnLi9wdWJzdWIvZXZlbnQtYXJncy90cmFjay1wbGF5LWFyZ3MnXHJcbmltcG9ydCB7IFNwb3RpZnlJbWcsIEZlYXR1cmVzRGF0YSwgSUFydGlzdFRyYWNrRGF0YSwgSVBsYXlhYmxlLCBFeHRlcm5hbFVybHMsIFRyYWNrRGF0YSB9IGZyb20gJy4uL3R5cGVzJ1xyXG5pbXBvcnQgRG91Ymx5TGlua2VkTGlzdCwgeyBEb3VibHlMaW5rZWRMaXN0Tm9kZSB9IGZyb20gJy4uL2NvbXBvbmVudHMvZG91Ymx5LWxpbmtlZC1saXN0J1xyXG5pbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnXHJcbmltcG9ydCBFdmVudEFnZ3JlZ2F0b3IgZnJvbSAnLi9wdWJzdWIvYWdncmVnYXRvcidcclxuXHJcbmNvbnN0IGV2ZW50QWdncmVnYXRvciA9ICh3aW5kb3cgYXMgYW55KS5ldmVudEFnZ3JlZ2F0b3IgYXMgRXZlbnRBZ2dyZWdhdG9yXHJcblxyXG5jbGFzcyBUcmFjayBleHRlbmRzIENhcmQgaW1wbGVtZW50cyBJUGxheWFibGUge1xyXG4gIHByaXZhdGUgZXh0ZXJuYWxVcmxzOiBFeHRlcm5hbFVybHM7XHJcbiAgcHJpdmF0ZSBfaWQ6IHN0cmluZztcclxuICBwcml2YXRlIF90aXRsZTogc3RyaW5nO1xyXG4gIHByaXZhdGUgX2R1cmF0aW9uOiBzdHJpbmc7XHJcbiAgcHJpdmF0ZSBfdXJpOiBzdHJpbmc7XHJcbiAgcG9wdWxhcml0eTogc3RyaW5nO1xyXG4gIHByaXZhdGUgX2RhdGVBZGRlZFRvUGxheWxpc3Q6IERhdGU7XHJcbiAgcmVsZWFzZURhdGU6IERhdGU7XHJcbiAgYWxidW06IEFsYnVtO1xyXG4gIGZlYXR1cmVzOiBGZWF0dXJlc0RhdGEgfCB1bmRlZmluZWQ7XHJcbiAgaW1hZ2VVcmw6IHN0cmluZztcclxuICBzZWxFbDogRWxlbWVudDtcclxuICBhcnRpc3RzRGF0YXM6IEFycmF5PElBcnRpc3RUcmFja0RhdGE+XHJcblxyXG4gIHB1YmxpYyBnZXQgaWQgKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy5faWRcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgdGl0bGUgKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy5fdGl0bGVcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgdXJpICgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMuX3VyaVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBkYXRlQWRkZWRUb1BsYXlsaXN0ICgpOiBEYXRlIHtcclxuICAgIHJldHVybiB0aGlzLl9kYXRlQWRkZWRUb1BsYXlsaXN0XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0RGF0ZUFkZGVkVG9QbGF5bGlzdCAodmFsOiBzdHJpbmcgfCBudW1iZXIgfCBEYXRlKSB7XHJcbiAgICB0aGlzLl9kYXRlQWRkZWRUb1BsYXlsaXN0ID0gbmV3IERhdGUodmFsKVxyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3IgKHByb3BzOiB7IHRpdGxlOiBzdHJpbmc7IGltYWdlczogQXJyYXk8U3BvdGlmeUltZz47IGR1cmF0aW9uOiBudW1iZXI7IHVyaTogc3RyaW5nOyBwb3B1bGFyaXR5OiBzdHJpbmc7IHJlbGVhc2VEYXRlOiBzdHJpbmc7IGlkOiBzdHJpbmc7IGFsYnVtOiBBbGJ1bTsgZXh0ZXJuYWxVcmxzOiBFeHRlcm5hbFVybHM7IGFydGlzdHM6IEFycmF5PHVua25vd24+OyBpZHg6IG51bWJlciB9KSB7XHJcbiAgICBzdXBlcigpXHJcbiAgICBjb25zdCB7XHJcbiAgICAgIHRpdGxlLFxyXG4gICAgICBpbWFnZXMsXHJcbiAgICAgIGR1cmF0aW9uLFxyXG4gICAgICB1cmksXHJcbiAgICAgIHBvcHVsYXJpdHksXHJcbiAgICAgIHJlbGVhc2VEYXRlLFxyXG4gICAgICBpZCxcclxuICAgICAgYWxidW0sXHJcbiAgICAgIGV4dGVybmFsVXJscyxcclxuICAgICAgYXJ0aXN0c1xyXG4gICAgfSA9IHByb3BzXHJcblxyXG4gICAgdGhpcy5leHRlcm5hbFVybHMgPSBleHRlcm5hbFVybHNcclxuICAgIHRoaXMuX2lkID0gaWRcclxuICAgIHRoaXMuX3RpdGxlID0gdGl0bGVcclxuICAgIHRoaXMuYXJ0aXN0c0RhdGFzID0gdGhpcy5maWx0ZXJEYXRhRnJvbUFydGlzdHMoYXJ0aXN0cylcclxuICAgIHRoaXMuX2R1cmF0aW9uID0gbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyhkdXJhdGlvbilcclxuICAgIHRoaXMuX2RhdGVBZGRlZFRvUGxheWxpc3QgPSBuZXcgRGF0ZSgpXHJcblxyXG4gICAgLy8gZWl0aGVyIHRoZSBub3JtYWwgdXJpLCBvciB0aGUgbGlua2VkX2Zyb20udXJpXHJcbiAgICB0aGlzLl91cmkgPSB1cmlcclxuICAgIHRoaXMucG9wdWxhcml0eSA9IHBvcHVsYXJpdHlcclxuICAgIHRoaXMucmVsZWFzZURhdGUgPSBuZXcgRGF0ZShyZWxlYXNlRGF0ZSlcclxuICAgIHRoaXMuYWxidW0gPSBhbGJ1bVxyXG4gICAgdGhpcy5mZWF0dXJlcyA9IHVuZGVmaW5lZFxyXG5cclxuICAgIHRoaXMuaW1hZ2VVcmwgPSBnZXRWYWxpZEltYWdlKGltYWdlcylcclxuICAgIHRoaXMuc2VsRWwgPSBodG1sVG9FbCgnPD48Lz4nKSBhcyBFbGVtZW50XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGZpbHRlckRhdGFGcm9tQXJ0aXN0cyAoYXJ0aXN0czogQXJyYXk8dW5rbm93bj4pIHtcclxuICAgIHJldHVybiBhcnRpc3RzLm1hcCgoYXJ0aXN0KSA9PiBhcnRpc3QgYXMgSUFydGlzdFRyYWNrRGF0YSlcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZW5lcmF0ZUhUTUxBcnRpc3ROYW1lcyAoKSB7XHJcbiAgICBsZXQgYXJ0aXN0TmFtZXMgPSAnJ1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmFydGlzdHNEYXRhcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBjb25zdCBhcnRpc3QgPSB0aGlzLmFydGlzdHNEYXRhc1tpXVxyXG4gICAgICBhcnRpc3ROYW1lcyArPSBgPGEgaHJlZj1cIiR7YXJ0aXN0LmV4dGVybmFsX3VybHMuc3BvdGlmeX1cIiB0YXJnZXQ9XCJfYmxhbmtcIj4ke2FydGlzdC5uYW1lfTwvYT5gXHJcblxyXG4gICAgICBpZiAoaSA8IHRoaXMuYXJ0aXN0c0RhdGFzLmxlbmd0aCAtIDEpIHtcclxuICAgICAgICBhcnRpc3ROYW1lcyArPSAnLCAnXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhcnRpc3ROYW1lc1xyXG4gIH1cclxuXHJcbiAgLyoqIFByb2R1Y2VzIHRoZSBjYXJkIGVsZW1lbnQgb2YgdGhpcyB0cmFjay5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpZHggLSBUaGUgY2FyZCBpbmRleCB0byB1c2UgZm9yIHRoZSBlbGVtZW50cyBpZCBzdWZmaXhcclxuICAgKiBAcmV0dXJucyB7Q2hpbGROb2RlfSAtIFRoZSBjb252ZXJ0ZWQgaHRtbCBzdHJpbmcgdG8gYW4gZWxlbWVudFxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRUcmFja0NhcmRIdG1sIChpZHg6IG51bWJlciwgdW5hbmltYXRlZEFwcGVhciA9IGZhbHNlKSA6IE5vZGUge1xyXG4gICAgY29uc3QgaWQgPSBgJHtjb25maWcuQ1NTLklEcy50cmFja1ByZWZpeH0ke2lkeH1gXHJcbiAgICB0aGlzLmNhcmRJZCA9IGlkXHJcbiAgICBjb25zdCBhcHBlYXJDbGFzcyA9IHVuYW5pbWF0ZWRBcHBlYXIgPyBjb25maWcuQ1NTLkNMQVNTRVMuYXBwZWFyIDogJydcclxuICAgIGNvbnN0IGh0bWwgPSBgXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5yYW5rQ2FyZH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLmZhZGVJblxyXG4gICAgfSAke2FwcGVhckNsYXNzfVwiPlxyXG4gICAgICAgICAgICAgIDxoNCBpZD1cIiR7Y29uZmlnLkNTUy5JRHMucmFua31cIj4ke2lkeCArIDF9LjwvaDQ+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmZsaXBDYXJkfSAke1xyXG4gICAgICBjb25maWcuQ1NTLkNMQVNTRVMubm9TZWxlY3RcclxuICAgIH0gICR7Y29uZmlnLkNTUy5DTEFTU0VTLmV4cGFuZE9uSG92ZXJ9XCI+XHJcbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuY2FyZH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLmZsaXBDYXJkSW5uZXJcclxuICAgIH0gJHtjb25maWcuQ1NTLkNMQVNTRVMudHJhY2t9XCIgaWQ9XCIke3RoaXMuZ2V0Q2FyZElkKCl9XCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5mbGlwQ2FyZEZyb250XHJcbiAgICAgICAgICAgICAgICAgIH1cIiAgdGl0bGU9XCJDbGljayB0byB2aWV3IG1vcmUgSW5mb1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPVwiJHt0aGlzLmltYWdlVXJsfVwiIGFsdD1cIkFsYnVtIENvdmVyXCI+PC9pbWc+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxoNCBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLnNjcm9sbGluZ1RleHRcclxuICAgIH1cIj4ke3RoaXMudGl0bGV9PC9oND5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9JHtjb25maWcuQ1NTLkNMQVNTRVMuZmxpcENhcmRCYWNrfT5cclxuICAgICAgICAgICAgICAgICAgICA8aDM+RHVyYXRpb246PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICA8cD4ke3RoaXMuX2R1cmF0aW9ufTwvcD5cclxuICAgICAgICAgICAgICAgICAgICA8aDM+UmVsZWFzZSBEYXRlOjwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgPHA+JHt0aGlzLnJlbGVhc2VEYXRlLnRvRGF0ZVN0cmluZygpfTwvcD5cclxuICAgICAgICAgICAgICAgICAgICA8aDM+QWxidW0gTmFtZTo8L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIke3RoaXMuYWxidW0uZXh0ZXJuYWxVcmx9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcH1cIj4ke1xyXG4gICAgICB0aGlzLmFsYnVtLm5hbWVcclxuICAgIH08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9hPlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIGBcclxuICAgIHJldHVybiBodG1sVG9FbChodG1sKSBhcyBOb2RlXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHBsYXlQYXVzZUNsaWNrICh0cmFja05vZGU6IERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT4pIHtcclxuICAgIGNvbnN0IHRyYWNrID0gdGhpcyBhcyBJUGxheWFibGVcclxuICAgIC8vIHNlbGVjdCB0aGlzIHRyYWNrIHRvIHBsYXkgb3IgcGF1c2UgYnkgcHVibGlzaGluZyB0aGUgdHJhY2sgcGxheSBldmVudCBhcmdcclxuICAgIGV2ZW50QWdncmVnYXRvci5wdWJsaXNoKG5ldyBQbGF5YWJsZUV2ZW50QXJnKHRyYWNrLCB0cmFja05vZGUpKVxyXG4gIH1cclxuXHJcbiAgLyoqIEdldCBhIHRyYWNrIGh0bWwgdG8gYmUgcGxhY2VkIGFzIGEgbGlzdCBlbGVtZW50LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCb29sZWFufSBkaXNwbGF5RGF0ZSAtIHdoZXRoZXIgdG8gZGlzcGxheSB0aGUgZGF0ZS5cclxuICAgKiBAcmV0dXJucyB7Q2hpbGROb2RlfSAtIFRoZSBjb252ZXJ0ZWQgaHRtbCBzdHJpbmcgdG8gYW4gZWxlbWVudFxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRQbGF5bGlzdFRyYWNrSHRtbCAodHJhY2tMaXN0OiBEb3VibHlMaW5rZWRMaXN0PElQbGF5YWJsZT4sIGRpc3BsYXlEYXRlOiBib29sZWFuID0gdHJ1ZSk6IE5vZGUge1xyXG4gICAgY29uc3QgdHJhY2tOb2RlID0gdHJhY2tMaXN0LmZpbmQoKHgpID0+IHgudXJpID09PSB0aGlzLnVyaSwgdHJ1ZSkgYXMgRG91Ymx5TGlua2VkTGlzdE5vZGU8SVBsYXlhYmxlPlxyXG5cclxuICAgIGNvbnN0IGh0bWwgPSBgXHJcbiAgICAgICAgICAgIDxsaSBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnBsYXlsaXN0VHJhY2t9XCI+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnBsYXlQYXVzZX0gJHtcclxuICAgICAgICAgICAgICAgIGlzU2FtZVBsYXlpbmdVUkkodGhpcy51cmkpID8gY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkIDogJydcclxuICAgICAgICAgICAgICB9XCI+PGltZyBzcmM9XCJcIiBhbHQ9XCJwbGF5L3BhdXNlXCIgXHJcbiAgICAgICAgICAgICAgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5ub1NlbGVjdH1cIi8+XHJcbiAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPGltZyBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLm5vU2VsZWN0fVwiIHNyYz1cIiR7XHJcbiAgICAgIHRoaXMuaW1hZ2VVcmxcclxuICAgIH1cIj48L2ltZz5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMubGlua3N9XCI+XHJcbiAgICAgICAgICAgICAgICA8YSBocmVmPVwiJHt0aGlzLmV4dGVybmFsVXJscy5zcG90aWZ5fVwiIHRhcmdldD1cIl9ibGFua1wiPlxyXG4gICAgICAgICAgICAgICAgICA8aDQgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5lbGxpcHNpc1dyYXB9ICR7XHJcbiAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5uYW1lXHJcbiAgICB9XCI+JHt0aGlzLnRpdGxlfVxyXG4gICAgICAgICAgICAgICAgICA8L2g0PlxyXG4gICAgICAgICAgICAgICAgPGEvPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcH1cIj5cclxuICAgICAgICAgICAgICAgICAgJHt0aGlzLmdlbmVyYXRlSFRNTEFydGlzdE5hbWVzKCl9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8aDU+JHt0aGlzLl9kdXJhdGlvbn08L2g1PlxyXG4gICAgICAgICAgICAgICR7XHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5RGF0ZVxyXG4gICAgICAgICAgICAgICAgICA/IGA8aDU+JHt0aGlzLmRhdGVBZGRlZFRvUGxheWxpc3QudG9Mb2NhbGVEYXRlU3RyaW5nKCl9PC9oNT5gXHJcbiAgICAgICAgICAgICAgICAgIDogJydcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIDwvbGk+XHJcbiAgICAgICAgICAgIGBcclxuXHJcbiAgICBjb25zdCBlbCA9IGh0bWxUb0VsKGh0bWwpXHJcblxyXG4gICAgLy8gZ2V0IHBsYXkgcGF1c2UgYnV0dG9uXHJcbiAgICBjb25zdCBwbGF5UGF1c2VCdG4gPSBlbD8uY2hpbGROb2Rlc1sxXVxyXG4gICAgaWYgKHBsYXlQYXVzZUJ0biA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BsYXkgcGF1c2UgYnV0dG9uIG9uIHRyYWNrIHdhcyBub3QgZm91bmQnKVxyXG4gICAgfVxyXG4gICAgdGhpcy5zZWxFbCA9IHBsYXlQYXVzZUJ0biBhcyBFbGVtZW50XHJcbiAgICBwbGF5UGF1c2VCdG4/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5wbGF5UGF1c2VDbGljayh0cmFja05vZGUpKVxyXG5cclxuICAgIGNoZWNrSWZJc1BsYXlpbmdFbEFmdGVyUmVyZW5kZXIodGhpcy51cmksIHBsYXlQYXVzZUJ0biBhcyBFbGVtZW50LCB0cmFja05vZGUpXHJcblxyXG4gICAgcmV0dXJuIGVsIGFzIE5vZGVcclxuICB9XHJcblxyXG4gIC8qKiBHZXQgYSB0cmFjayBodG1sIHRvIGJlIHBsYWNlZCBhcyBhIGxpc3QgZWxlbWVudCBvbiBhIHJhbmtlZCBsaXN0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEb3VibHlMaW5rZWRMaXN0PFRyYWNrPn0gdHJhY2tMaXN0IC0gbGlzdCBvZiB0cmFja3MgdGhhdCBjb250YWlucyB0aGlzIHRyYWNrLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYW5rIC0gdGhlIHJhbmsgb2YgdGhpcyBjYXJkXHJcbiAgICogQHJldHVybnMge0NoaWxkTm9kZX0gLSBUaGUgY29udmVydGVkIGh0bWwgc3RyaW5nIHRvIGFuIGVsZW1lbnRcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0UmFua2VkVHJhY2tIdG1sICh0cmFja0xpc3Q6IERvdWJseUxpbmtlZExpc3Q8VHJhY2s+LCByYW5rOiBudW1iZXIpOiBOb2RlIHtcclxuICAgIGNvbnN0IHRyYWNrTm9kZSA9IHRyYWNrTGlzdC5maW5kKCh4KSA9PiB4LnVyaSA9PT0gdGhpcy51cmksIHRydWUpIGFzIERvdWJseUxpbmtlZExpc3ROb2RlPElQbGF5YWJsZT5cclxuICAgIGNvbnN0IGh0bWwgPSBgXHJcbiAgICAgICAgICAgIDxsaSBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLnBsYXlsaXN0VHJhY2t9XCI+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5yYW5rZWRUcmFja0ludGVyYWN0fVwiPlxyXG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5wbGF5UGF1c2V9ICR7XHJcbiAgICAgICAgICAgICAgICAgIGlzU2FtZVBsYXlpbmdVUkkodGhpcy51cmkpID8gY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkIDogJydcclxuICAgICAgICAgICAgICAgIH1cIj48aW1nIHNyYz1cIlwiIGFsdD1cInBsYXkvcGF1c2VcIiBcclxuICAgICAgICAgICAgICAgIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMubm9TZWxlY3R9XCIvPlxyXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDxwPiR7cmFua30uPC9wPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMubm9TZWxlY3R9XCIgc3JjPVwiJHtcclxuICAgICAgdGhpcy5pbWFnZVVybFxyXG4gICAgfVwiPjwvaW1nPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke2NvbmZpZy5DU1MuQ0xBU1NFUy5saW5rc31cIj5cclxuICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIke3RoaXMuZXh0ZXJuYWxVcmxzLnNwb3RpZnl9XCIgdGFyZ2V0PVwiX2JsYW5rXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxoNCBjbGFzcz1cIiR7Y29uZmlnLkNTUy5DTEFTU0VTLmVsbGlwc2lzV3JhcH0gJHtcclxuICAgICAgY29uZmlnLkNTUy5DTEFTU0VTLm5hbWVcclxuICAgIH1cIj4ke3RoaXMudGl0bGV9XHJcbiAgICAgICAgICAgICAgICAgIDwvaDQ+XHJcbiAgICAgICAgICAgICAgICA8YS8+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtjb25maWcuQ1NTLkNMQVNTRVMuZWxsaXBzaXNXcmFwfVwiPlxyXG4gICAgICAgICAgICAgICAgICAke3RoaXMuZ2VuZXJhdGVIVE1MQXJ0aXN0TmFtZXMoKX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxoNT4ke3RoaXMuX2R1cmF0aW9ufTwvaDU+XHJcbiAgICAgICAgICAgIDwvbGk+XHJcbiAgICAgICAgICAgIGBcclxuXHJcbiAgICBjb25zdCBlbCA9IGh0bWxUb0VsKGh0bWwpXHJcblxyXG4gICAgLy8gZ2V0IHBsYXkgcGF1c2UgYnV0dG9uXHJcbiAgICBjb25zdCBwbGF5UGF1c2VCdG4gPSBlbD8uY2hpbGROb2Rlc1sxXS5jaGlsZE5vZGVzWzFdXHJcblxyXG4gICAgaWYgKHBsYXlQYXVzZUJ0biA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BsYXkgcGF1c2UgYnV0dG9uIG9uIHRyYWNrIHdhcyBub3QgZm91bmQnKVxyXG4gICAgfVxyXG4gICAgdGhpcy5zZWxFbCA9IHBsYXlQYXVzZUJ0biBhcyBFbGVtZW50XHJcbiAgICBwbGF5UGF1c2VCdG4/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAvLyBzZWxlY3QgdGhlIHJhbmsgYXJlYSBhcyB0byBrZWVwIHRoZSBwbGF5L3BhdXNlIGljb24gc2hvd25cclxuICAgICAgY29uc3QgcmFua2VkSW50ZXJhY3QgPSAoZWwgYXMgSFRNTEVsZW1lbnQpLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY29uZmlnLkNTUy5DTEFTU0VTLnJhbmtlZFRyYWNrSW50ZXJhY3QpWzBdXHJcbiAgICAgIC8vIHJhbmtlZEludGVyYWN0LmNsYXNzTGlzdC50b2dnbGUoY29uZmlnLkNTUy5DTEFTU0VTLnNlbGVjdGVkKVxyXG4gICAgICB0aGlzLnBsYXlQYXVzZUNsaWNrKHRyYWNrTm9kZSlcclxuICAgIH0pXHJcblxyXG4gICAgY2hlY2tJZklzUGxheWluZ0VsQWZ0ZXJSZXJlbmRlcih0aGlzLnVyaSwgcGxheVBhdXNlQnRuIGFzIEVsZW1lbnQsIHRyYWNrTm9kZSlcclxuXHJcbiAgICByZXR1cm4gZWwgYXMgTm9kZVxyXG4gIH1cclxuXHJcbiAgLyoqIExvYWQgdGhlIGZlYXR1cmVzIG9mIHRoaXMgdHJhY2sgZnJvbSB0aGUgc3BvdGlmeSB3ZWIgYXBpLiAqL1xyXG4gIHB1YmxpYyBhc3luYyBsb2FkRmVhdHVyZXMgKCkge1xyXG4gICAgY29uc3QgcmVzID0gYXdhaXQgYXhpb3NcclxuICAgICAgLmdldChjb25maWcuVVJMcy5nZXRUcmFja0ZlYXR1cmVzICsgdGhpcy5pZClcclxuICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICB0aHJvdyBlcnJcclxuICAgICAgfSlcclxuICAgIGNvbnN0IGZlYXRzID0gcmVzLmRhdGEuYXVkaW9fZmVhdHVyZXNcclxuICAgIHRoaXMuZmVhdHVyZXMgPSB7XHJcbiAgICAgIGRhbmNlYWJpbGl0eTogZmVhdHMuZGFuY2VhYmlsaXR5LFxyXG4gICAgICBhY291c3RpY25lc3M6IGZlYXRzLmFjb3VzdGljbmVzcyxcclxuICAgICAgaW5zdHJ1bWVudGFsbmVzczogZmVhdHMuaW5zdHJ1bWVudGFsbmVzcyxcclxuICAgICAgdmFsZW5jZTogZmVhdHMudmFsZW5jZSxcclxuICAgICAgZW5lcmd5OiBmZWF0cy5lbmVyZ3lcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5mZWF0dXJlc1xyXG4gIH1cclxufVxyXG5cclxuLyoqIEdlbmVyYXRlIHRyYWNrcyBmcm9tIGRhdGEgZXhjbHVkaW5nIGRhdGUgYWRkZWQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7QXJyYXk8VHJhY2tEYXRhPn0gZGF0YXNcclxuICogQHBhcmFtIHtEb3VibHlMaW5rZWRMaXN0PFRyYWNrPiB8IEFycmF5PFRyYWNrPn0gdHJhY2tzIC0gZG91YmxlIGxpbmtlZCBsaXN0XHJcbiAqIEByZXR1cm5zXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVUcmFja3NGcm9tRGF0YSAoZGF0YXM6IEFycmF5PFRyYWNrRGF0YT4sIHRyYWNrczogRG91Ymx5TGlua2VkTGlzdDxUcmFjaz4gfCBBcnJheTxUcmFjaz4pIHtcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGFzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBjb25zdCBkYXRhID0gZGF0YXNbaV1cclxuICAgIGlmIChkYXRhKSB7XHJcbiAgICAgIGNvbnN0IHByb3BzID0ge1xyXG4gICAgICAgIHRpdGxlOiBkYXRhLm5hbWUsXHJcbiAgICAgICAgaW1hZ2VzOiBkYXRhLmFsYnVtLmltYWdlcyxcclxuICAgICAgICBkdXJhdGlvbjogZGF0YS5kdXJhdGlvbl9tcyxcclxuICAgICAgICB1cmk6IGRhdGEubGlua2VkX2Zyb20gIT09IHVuZGVmaW5lZCA/IGRhdGEubGlua2VkX2Zyb20udXJpIDogZGF0YS51cmksXHJcbiAgICAgICAgcG9wdWxhcml0eTogZGF0YS5wb3B1bGFyaXR5LFxyXG4gICAgICAgIHJlbGVhc2VEYXRlOiBkYXRhLmFsYnVtLnJlbGVhc2VfZGF0ZSxcclxuICAgICAgICBpZDogZGF0YS5pZCxcclxuICAgICAgICBhbGJ1bTogbmV3IEFsYnVtKGRhdGEuYWxidW0ubmFtZSwgZGF0YS5hbGJ1bS5leHRlcm5hbF91cmxzLnNwb3RpZnkpLFxyXG4gICAgICAgIGV4dGVybmFsVXJsczogZGF0YS5leHRlcm5hbF91cmxzLFxyXG4gICAgICAgIGFydGlzdHM6IGRhdGEuYXJ0aXN0cyxcclxuICAgICAgICBpZHg6IGlcclxuICAgICAgfVxyXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh0cmFja3MpKSB7XHJcbiAgICAgICAgdHJhY2tzLnB1c2gobmV3IFRyYWNrKHByb3BzKSlcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0cmFja3MuYWRkKG5ldyBUcmFjayhwcm9wcykpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHRyYWNrc1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUcmFja1xyXG4iLCJcclxuaW1wb3J0IGludGVyYWN0IGZyb20gJ2ludGVyYWN0anMnXHJcbmltcG9ydCBJbnRlcmFjdCBmcm9tICdAaW50ZXJhY3Rqcy90eXBlcydcclxuaW1wb3J0IHsgSVByb21pc2VIYW5kbGVyUmV0dXJuLCBTcG90aWZ5SW1nIH0gZnJvbSAnLi90eXBlcydcclxuXHJcbmNvbnN0IGF1dGhFbmRwb2ludCA9ICdodHRwczovL2FjY291bnRzLnNwb3RpZnkuY29tL2F1dGhvcml6ZSdcclxuLy8gUmVwbGFjZSB3aXRoIHlvdXIgYXBwJ3MgY2xpZW50IElELCByZWRpcmVjdCBVUkkgYW5kIGRlc2lyZWQgc2NvcGVzXHJcbmNvbnN0IHJlZGlyZWN0VXJpID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCdcclxuY29uc3QgY2xpZW50SWQgPSAnNDM0ZjVlOWY0NDJhNGU0NTg2ZTA4OWEzM2Y2NWM4NTcnXHJcbmNvbnN0IHNjb3BlcyA9IFtcclxuICAndWdjLWltYWdlLXVwbG9hZCcsXHJcbiAgJ3VzZXItcmVhZC1wbGF5YmFjay1zdGF0ZScsXHJcbiAgJ3VzZXItbW9kaWZ5LXBsYXliYWNrLXN0YXRlJyxcclxuICAndXNlci1yZWFkLWN1cnJlbnRseS1wbGF5aW5nJyxcclxuICAnc3RyZWFtaW5nJyxcclxuICAnYXBwLXJlbW90ZS1jb250cm9sJyxcclxuICAndXNlci1yZWFkLWVtYWlsJyxcclxuICAndXNlci1yZWFkLXByaXZhdGUnLFxyXG4gICdwbGF5bGlzdC1yZWFkLWNvbGxhYm9yYXRpdmUnLFxyXG4gICdwbGF5bGlzdC1tb2RpZnktcHVibGljJyxcclxuICAncGxheWxpc3QtcmVhZC1wcml2YXRlJyxcclxuICAncGxheWxpc3QtbW9kaWZ5LXByaXZhdGUnLFxyXG4gICd1c2VyLWxpYnJhcnktbW9kaWZ5JyxcclxuICAndXNlci1saWJyYXJ5LXJlYWQnLFxyXG4gICd1c2VyLXRvcC1yZWFkJyxcclxuICAndXNlci1yZWFkLXBsYXliYWNrLXBvc2l0aW9uJyxcclxuICAndXNlci1yZWFkLXJlY2VudGx5LXBsYXllZCcsXHJcbiAgJ3VzZXItZm9sbG93LXJlYWQnLFxyXG4gICd1c2VyLWZvbGxvdy1tb2RpZnknXHJcbl1cclxuZXhwb3J0IGNvbnN0IGNvbmZpZyA9IHtcclxuICBDU1M6IHtcclxuICAgIElEczoge1xyXG4gICAgICByZW1vdmVFYXJseUFkZGVkOiAncmVtb3ZlLWVhcmx5LWFkZGVkJyxcclxuICAgICAgZ2V0VG9rZW5Mb2FkaW5nU3Bpbm5lcjogJ2dldC10b2tlbi1sb2FkaW5nLXNwaW5uZXInLFxyXG4gICAgICBwbGF5bGlzdENhcmRzQ29udGFpbmVyOiAncGxheWxpc3QtY2FyZHMtY29udGFpbmVyJyxcclxuICAgICAgdHJhY2tDYXJkc0NvbnRhaW5lcjogJ3RyYWNrLWNhcmRzLWNvbnRhaW5lcicsXHJcbiAgICAgIHBsYXlsaXN0UHJlZml4OiAncGxheWxpc3QtJyxcclxuICAgICAgdHJhY2tQcmVmaXg6ICd0cmFjay0nLFxyXG4gICAgICBzcG90aWZ5Q29udGFpbmVyOiAnc3BvdGlmeS1jb250YWluZXInLFxyXG4gICAgICBpbmZvQ29udGFpbmVyOiAnaW5mby1jb250YWluZXInLFxyXG4gICAgICBhbGxvd0FjY2Vzc0hlYWRlcjogJ2FsbG93LWFjY2Vzcy1oZWFkZXInLFxyXG4gICAgICBleHBhbmRlZFBsYXlsaXN0TW9kczogJ2V4cGFuZGVkLXBsYXlsaXN0LW1vZHMnLFxyXG4gICAgICBwbGF5bGlzdE1vZHM6ICdwbGF5bGlzdC1tb2RzJyxcclxuICAgICAgdHJhY2tzRGF0YTogJ3RyYWNrcy1kYXRhJyxcclxuICAgICAgdHJhY2tzQ2hhcnQ6ICd0cmFja3MtY2hhcnQnLFxyXG4gICAgICB0cmFja3NUZXJtU2VsZWN0aW9uczogJ3RyYWNrcy10ZXJtLXNlbGVjdGlvbnMnLFxyXG4gICAgICBmZWF0dXJlU2VsZWN0aW9uczogJ2ZlYXR1cmUtc2VsZWN0aW9ucycsXHJcbiAgICAgIHBsYXlsaXN0c1NlY3Rpb246ICdwbGF5bGlzdHMtc2VjdGlvbicsXHJcbiAgICAgIHVuZG86ICd1bmRvJyxcclxuICAgICAgcmVkbzogJ3JlZG8nLFxyXG4gICAgICBtb2RzT3BlbmVyOiAnbW9kcy1vcGVuZXInLFxyXG4gICAgICBmZWF0RGVmOiAnZmVhdC1kZWZpbml0aW9uJyxcclxuICAgICAgZmVhdEF2ZXJhZ2U6ICdmZWF0LWF2ZXJhZ2UnLFxyXG4gICAgICByYW5rOiAncmFuaycsXHJcbiAgICAgIHZpZXdBbGxUb3BUcmFja3M6ICd2aWV3LWFsbC10b3AtdHJhY2tzJyxcclxuICAgICAgZW1vamlzOiAnZW1vamlzJyxcclxuICAgICAgYXJ0aXN0Q2FyZHNDb250YWluZXI6ICdhcnRpc3QtY2FyZHMtY29udGFpbmVyJyxcclxuICAgICAgYXJ0aXN0UHJlZml4OiAnYXJ0aXN0LScsXHJcbiAgICAgIGluaXRpYWxDYXJkOiAnaW5pdGlhbC1jYXJkJyxcclxuICAgICAgY29udmVydENhcmQ6ICdjb252ZXJ0LWNhcmQnLFxyXG4gICAgICBhcnRpc3RUZXJtU2VsZWN0aW9uczogJ2FydGlzdHMtdGVybS1zZWxlY3Rpb25zJyxcclxuICAgICAgcHJvZmlsZUhlYWRlcjogJ3Byb2ZpbGUtaGVhZGVyJyxcclxuICAgICAgY2xlYXJEYXRhOiAnY2xlYXItZGF0YScsXHJcbiAgICAgIGxpa2VkVHJhY2tzOiAnbGlrZWQtdHJhY2tzJyxcclxuICAgICAgZm9sbG93ZWRBcnRpc3RzOiAnZm9sbG93ZWQtYXJ0aXN0cycsXHJcbiAgICAgIHdlYlBsYXllcjogJ3dlYi1wbGF5ZXInLFxyXG4gICAgICBwbGF5VGltZUJhcjogJ3BsYXl0aW1lLWJhcicsXHJcbiAgICAgIHBsYXlsaXN0SGVhZGVyQXJlYTogJ3BsYXlsaXN0LW1haW4taGVhZGVyLWFyZWEnLFxyXG4gICAgICBwbGF5TmV4dDogJ3BsYXktbmV4dCcsXHJcbiAgICAgIHBsYXlQcmV2OiAncGxheS1wcmV2JyxcclxuICAgICAgd2ViUGxheWVyUGxheVBhdXNlOiAncGxheS1wYXVzZS1wbGF5ZXInXHJcbiAgICB9LFxyXG4gICAgQ0xBU1NFUzoge1xyXG4gICAgICBnbG93OiAnZ2xvdycsXHJcbiAgICAgIHBsYXlsaXN0OiAncGxheWxpc3QnLFxyXG4gICAgICB0cmFjazogJ3RyYWNrJyxcclxuICAgICAgYXJ0aXN0OiAnYXJ0aXN0JyxcclxuICAgICAgcmFua0NhcmQ6ICdyYW5rLWNhcmQnLFxyXG4gICAgICBwbGF5bGlzdFRyYWNrOiAncGxheWxpc3QtdHJhY2snLFxyXG4gICAgICBpbmZvTG9hZGluZ1NwaW5uZXJzOiAnaW5mby1sb2FkaW5nLXNwaW5uZXInLFxyXG4gICAgICBhcHBlYXI6ICdhcHBlYXInLFxyXG4gICAgICBoaWRlOiAnaGlkZScsXHJcbiAgICAgIHNlbGVjdGVkOiAnc2VsZWN0ZWQnLFxyXG4gICAgICBjYXJkOiAnY2FyZCcsXHJcbiAgICAgIHBsYXlsaXN0U2VhcmNoOiAncGxheWxpc3Qtc2VhcmNoJyxcclxuICAgICAgZWxsaXBzaXNXcmFwOiAnZWxsaXBzaXMtd3JhcCcsXHJcbiAgICAgIG5hbWU6ICduYW1lJyxcclxuICAgICAgcGxheWxpc3RPcmRlcjogJ3BsYXlsaXN0LW9yZGVyJyxcclxuICAgICAgY2hhcnRJbmZvOiAnY2hhcnQtaW5mbycsXHJcbiAgICAgIGZsaXBDYXJkSW5uZXI6ICdmbGlwLWNhcmQtaW5uZXInLFxyXG4gICAgICBmbGlwQ2FyZEZyb250OiAnZmxpcC1jYXJkLWZyb250JyxcclxuICAgICAgZmxpcENhcmRCYWNrOiAnZmxpcC1jYXJkLWJhY2snLFxyXG4gICAgICBmbGlwQ2FyZDogJ2ZsaXAtY2FyZCcsXHJcbiAgICAgIHJlc2l6ZUNvbnRhaW5lcjogJ3Jlc2l6ZS1jb250YWluZXInLFxyXG4gICAgICBzY3JvbGxMZWZ0OiAnc2Nyb2xsLWxlZnQnLFxyXG4gICAgICBzY3JvbGxpbmdUZXh0OiAnc2Nyb2xsaW5nLXRleHQnLFxyXG4gICAgICBub1NlbGVjdDogJ25vLXNlbGVjdCcsXHJcbiAgICAgIGRyb3BEb3duOiAnZHJvcC1kb3duJyxcclxuICAgICAgZXhwYW5kYWJsZVR4dENvbnRhaW5lcjogJ2V4cGFuZGFibGUtdGV4dC1jb250YWluZXInLFxyXG4gICAgICBib3JkZXJDb3ZlcjogJ2JvcmRlci1jb3ZlcicsXHJcbiAgICAgIGZpcnN0RXhwYW5zaW9uOiAnZmlyc3QtZXhwYW5zaW9uJyxcclxuICAgICAgc2Vjb25kRXhwYW5zaW9uOiAnc2Vjb25kLWV4cGFuc2lvbicsXHJcbiAgICAgIGludmlzaWJsZTogJ2ludmlzaWJsZScsXHJcbiAgICAgIGZhZGVJbjogJ2ZhZGUtaW4nLFxyXG4gICAgICBmcm9tVG9wOiAnZnJvbS10b3AnLFxyXG4gICAgICBleHBhbmRPbkhvdmVyOiAnZXhwYW5kLW9uLWhvdmVyJyxcclxuICAgICAgdHJhY2tzQXJlYTogJ3RyYWNrcy1hcmVhJyxcclxuICAgICAgc2Nyb2xsQmFyOiAnc2Nyb2xsLWJhcicsXHJcbiAgICAgIHRyYWNrTGlzdDogJ3RyYWNrLWxpc3QnLFxyXG4gICAgICBhcnRpc3RUb3BUcmFja3M6ICdhcnRpc3QtdG9wLXRyYWNrcycsXHJcbiAgICAgIHRleHRGb3JtOiAndGV4dC1mb3JtJyxcclxuICAgICAgY29udGVudDogJ2NvbnRlbnQnLFxyXG4gICAgICBsaW5rczogJ2xpbmtzJyxcclxuICAgICAgcHJvZ3Jlc3M6ICdwcm9ncmVzcycsXHJcbiAgICAgIHByb2dyZXNzQmFyOiAncHJvZ3Jlc3MtYmFyJyxcclxuICAgICAgcGxheVBhdXNlOiAncGxheS1wYXVzZScsXHJcbiAgICAgIHJhbmtlZFRyYWNrSW50ZXJhY3Q6ICdyYW5rZWQtY2FyZC1pbnRlcmFjdGlvbi1hcmVhJ1xyXG4gICAgfSxcclxuICAgIEFUVFJJQlVURVM6IHtcclxuICAgICAgZGF0YVNlbGVjdGlvbjogJ2RhdGEtc2VsZWN0aW9uJ1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgVVJMczoge1xyXG4gICAgc2l0ZVVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcsXHJcbiAgICBhdXRoOiBgJHthdXRoRW5kcG9pbnR9P2NsaWVudF9pZD0ke2NsaWVudElkfSZyZWRpcmVjdF91cmk9JHtyZWRpcmVjdFVyaX0mc2NvcGU9JHtzY29wZXMuam9pbihcclxuICAgICAgJyUyMCdcclxuICAgICl9JnJlc3BvbnNlX3R5cGU9Y29kZSZzaG93X2RpYWxvZz10cnVlYCxcclxuICAgIGdldEhhc1Rva2VuczogJy90b2tlbnMvaGFzLXRva2VucycsXHJcbiAgICBnZXRBY2Nlc3NUb2tlbjogJy90b2tlbnMvZ2V0LWFjY2Vzcy10b2tlbicsXHJcbiAgICBnZXRPYnRhaW5Ub2tlbnNQcmVmaXg6IChjb2RlOiBzdHJpbmcpID0+IGAvdG9rZW5zL29idGFpbi10b2tlbnM/Y29kZT0ke2NvZGV9YCxcclxuICAgIGdldFRvcEFydGlzdHM6ICcvc3BvdGlmeS9nZXQtdG9wLWFydGlzdHM/dGltZV9yYW5nZT0nLFxyXG4gICAgZ2V0VG9wVHJhY2tzOiAnL3Nwb3RpZnkvZ2V0LXRvcC10cmFja3M/dGltZV9yYW5nZT0nLFxyXG4gICAgZ2V0UGxheWxpc3RzOiAnL3Nwb3RpZnkvZ2V0LXBsYXlsaXN0cycsXHJcbiAgICBnZXRQbGF5bGlzdFRyYWNrczogJy9zcG90aWZ5L2dldC1wbGF5bGlzdC10cmFja3M/cGxheWxpc3RfaWQ9JyxcclxuICAgIHB1dENsZWFyVG9rZW5zOiAnL3Rva2Vucy9jbGVhci10b2tlbnMnLFxyXG4gICAgZGVsZXRlUGxheWxpc3RUcmFja3M6IChwbGF5bGlzdElkOiBzdHJpbmcpID0+IGAvc3BvdGlmeS9kZWxldGUtcGxheWxpc3QtaXRlbXM/cGxheWxpc3RfaWQ9JHtwbGF5bGlzdElkfWAsXHJcbiAgICBwb3N0UGxheWxpc3RUcmFja3M6IChwbGF5bGlzdElkOiBzdHJpbmcpID0+IGAvc3BvdGlmeS9wb3N0LXBsYXlsaXN0LWl0ZW1zP3BsYXlsaXN0X2lkPSR7cGxheWxpc3RJZH1gLFxyXG4gICAgZ2V0VHJhY2tGZWF0dXJlczogJy9zcG90aWZ5L2dldC10cmFja3MtZmVhdHVyZXM/dHJhY2tfaWRzPScsXHJcbiAgICBwdXRSZWZyZXNoQWNjZXNzVG9rZW46ICcvdG9rZW5zL3JlZnJlc2gtdG9rZW4nLFxyXG4gICAgcHV0U2Vzc2lvbkRhdGE6ICcvc3BvdGlmeS9wdXQtc2Vzc2lvbi1kYXRhP2F0dHI9JyxcclxuICAgIHB1dFBsYXlsaXN0UmVzaXplRGF0YTogKHZhbDogc3RyaW5nKSA9PiBgL3Nwb3RpZnkvcHV0LXBsYXlsaXN0LXJlc2l6ZS1kYXRhP3ZhbD0ke3ZhbH1gLFxyXG4gICAgZ2V0UGxheWxpc3RSZXNpemVEYXRhOiAnL3Nwb3RpZnkvZ2V0LXBsYXlsaXN0LXJlc2l6ZS1kYXRhJyxcclxuICAgIHB1dFBsYXlsaXN0SXNJblRleHRGb3JtRGF0YTogKHZhbDogc3RyaW5nKSA9PiBgL3Nwb3RpZnkvcHV0LXBsYXlsaXN0LXRleHQtZm9ybS1kYXRhP3ZhbD0ke3ZhbH1gLFxyXG4gICAgZ2V0UGxheWxpc3RJc0luVGV4dEZvcm1EYXRhOiAnL3Nwb3RpZnkvZ2V0LXBsYXlsaXN0LXRleHQtZm9ybS1kYXRhJyxcclxuICAgIGdldEFydGlzdFRvcFRyYWNrczogKGlkOiBzdHJpbmcpID0+IGAvc3BvdGlmeS9nZXQtYXJ0aXN0LXRvcC10cmFja3M/aWQ9JHtpZH1gLFxyXG4gICAgZ2V0Q3VycmVudFVzZXJQcm9maWxlOiAnL3Nwb3RpZnkvZ2V0LWN1cnJlbnQtdXNlci1wcm9maWxlJyxcclxuICAgIHB1dENsZWFyU2Vzc2lvbjogJy9jbGVhci1zZXNzaW9uJyxcclxuICAgIGdldEN1cnJlbnRVc2VyU2F2ZWRUcmFja3M6ICcvc3BvdGlmeS9nZXQtY3VycmVudC11c2VyLXNhdmVkLXRyYWNrcycsXHJcbiAgICBnZXRGb2xsb3dlZEFydGlzdHM6ICcvc3BvdGlmeS9nZXQtZm9sbG93ZWQtYXJ0aXN0cycsXHJcbiAgICBwdXRQbGF5VHJhY2s6IChkZXZpY2VfaWQ6IHN0cmluZywgdHJhY2tfdXJpOiBzdHJpbmcpID0+XHJcbiAgICAgIGAvc3BvdGlmeS9wbGF5LXRyYWNrP2RldmljZV9pZD0ke2RldmljZV9pZH0mdHJhY2tfdXJpPSR7dHJhY2tfdXJpfWBcclxuICB9LFxyXG4gIFBBVEhTOiB7XHJcbiAgICBzcGlubmVyOiAnL2ltYWdlcy8yMDBweExvYWRpbmdTcGlubmVyLnN2ZycsXHJcbiAgICBhY291c3RpY0Vtb2ppOiAnL2ltYWdlcy9FbW9qaXMvQWNvdXN0aWNFbW9qaS5zdmcnLFxyXG4gICAgbm9uQWNvdXN0aWNFbW9qaTogJy9pbWFnZXMvRW1vamlzL0VsZWN0cmljR3VpdGFyRW1vamkuc3ZnJyxcclxuICAgIGhhcHB5RW1vamk6ICcvaW1hZ2VzL0Vtb2ppcy9IYXBweUVtb2ppLnN2ZycsXHJcbiAgICBuZXV0cmFsRW1vamk6ICcvaW1hZ2VzL0Vtb2ppcy9OZXV0cmFsRW1vamkuc3ZnJyxcclxuICAgIHNhZEVtb2ppOiAnL2ltYWdlcy9FbW9qaXMvU2FkRW1vamkuc3ZnJyxcclxuICAgIGluc3RydW1lbnRFbW9qaTogJy9pbWFnZXMvRW1vamlzL0luc3RydW1lbnRFbW9qaS5zdmcnLFxyXG4gICAgc2luZ2VyRW1vamk6ICcvaW1hZ2VzL0Vtb2ppcy9TaW5nZXJFbW9qaS5zdmcnLFxyXG4gICAgZGFuY2luZ0Vtb2ppOiAnL2ltYWdlcy9FbW9qaXMvRGFuY2luZ0Vtb2ppLnN2ZycsXHJcbiAgICBzaGVlcEVtb2ppOiAnL2ltYWdlcy9FbW9qaXMvU2hlZXBFbW9qaS5zdmcnLFxyXG4gICAgd29sZkVtb2ppOiAnL2ltYWdlcy9FbW9qaXMvV29sZkVtb2ppLnN2ZycsXHJcbiAgICBncmlkVmlldzogJy9pbWFnZXMvZ3JpZC12aWV3LWljb24ucG5nJyxcclxuICAgIGxpc3RWaWV3OiAnL2ltYWdlcy9saXN0LXZpZXctaWNvbi5wbmcnLFxyXG4gICAgY2hldnJvbkxlZnQ6ICcvaW1hZ2VzL2NoZXZyb24tbGVmdC5wbmcnLFxyXG4gICAgY2hldnJvblJpZ2h0OiAnL2ltYWdlcy9jaGV2cm9uLXJpZ2h0LnBuZycsXHJcbiAgICBwbGF5SWNvbjogJy9pbWFnZXMvcGxheS0zMHB4LnBuZycsXHJcbiAgICBwYXVzZUljb246ICcvaW1hZ2VzL3BhdXNlLTMwcHgucG5nJyxcclxuICAgIHBsYXlCbGFja0ljb246ICcvaW1hZ2VzL3BsYXktYmxhY2stMzBweC5wbmcnLFxyXG4gICAgcGF1c2VCbGFja0ljb246ICcvaW1hZ2VzL3BhdXNlLWJsYWNrLTMwcHgucG5nJyxcclxuICAgIHBsYXlOZXh0OiAnL2ltYWdlcy9uZXh0LTMwcHgucG5nJyxcclxuICAgIHBsYXlQcmV2OiAnL2ltYWdlcy9wcmV2aW91cy0zMHB4LnBuZydcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtaWxsaXNUb01pbnV0ZXNBbmRTZWNvbmRzIChtaWxsaXM6IG51bWJlcikge1xyXG4gIGNvbnN0IG1pbnV0ZXM6IG51bWJlciA9IE1hdGguZmxvb3IobWlsbGlzIC8gNjAwMDApXHJcbiAgY29uc3Qgc2Vjb25kczogbnVtYmVyID0gcGFyc2VJbnQoKChtaWxsaXMgJSA2MDAwMCkgLyAxMDAwKS50b0ZpeGVkKDApKVxyXG4gIHJldHVybiBzZWNvbmRzID09PSA2MFxyXG4gICAgPyBtaW51dGVzICsgMSArICc6MDAnXHJcbiAgICA6IG1pbnV0ZXMgKyAnOicgKyAoc2Vjb25kcyA8IDEwID8gJzAnIDogJycpICsgc2Vjb25kc1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBodG1sVG9FbCAoaHRtbDogc3RyaW5nKSB7XHJcbiAgY29uc3QgdGVtcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJylcclxuICBodG1sID0gaHRtbC50cmltKCkgLy8gTmV2ZXIgcmV0dXJuIGEgc3BhY2UgdGV4dCBub2RlIGFzIGEgcmVzdWx0XHJcbiAgdGVtcC5pbm5lckhUTUwgPSBodG1sXHJcbiAgcmV0dXJuIHRlbXAuY29udGVudC5maXJzdENoaWxkXHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcm9taXNlSGFuZGxlcjxUPiAoXHJcbiAgcHJvbWlzZTogUHJvbWlzZTxUPixcclxuICBvblN1Y2Nlc2Z1bCA9IChyZXM6IFQpID0+IHsgfSxcclxuICBvbkZhaWx1cmUgPSAoZXJyOiB1bmtub3duKSA9PiB7XHJcbiAgICBpZiAoZXJyKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcigpXHJcbiAgICB9XHJcbiAgfVxyXG4pIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzID0gYXdhaXQgcHJvbWlzZVxyXG4gICAgb25TdWNjZXNmdWwocmVzIGFzIFQpXHJcbiAgICByZXR1cm4geyByZXM6IHJlcywgZXJyOiBudWxsIH0gYXMgSVByb21pc2VIYW5kbGVyUmV0dXJuPFQ+XHJcbiAgfSBjYXRjaCAoZXJyOiB1bmtub3duKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKGVycilcclxuICAgIG9uRmFpbHVyZShlcnIpXHJcbiAgICByZXR1cm4geyByZXM6IG51bGwsIGVycjogZXJyIH0gYXMgSVByb21pc2VIYW5kbGVyUmV0dXJuPFQ+XHJcbiAgfVxyXG59XHJcblxyXG4vKiogRmlsdGVycyAnbGknIGVsZW1lbnRzIHRvIGVpdGhlciBiZSBoaWRkZW4gb3Igbm90IGRlcGVuZGluZyBvbiBpZlxyXG4gKiB0aGV5IGNvbnRhaW4gc29tZSBnaXZlbiBpbnB1dCB0ZXh0LlxyXG4gKlxyXG4gKiBAcGFyYW0ge0hUTUx9IHVsIC0gdW5vcmRlcmVkIGxpc3QgZWxlbWVudCB0aGF0IGNvbnRhaW5zIHRoZSAnbGknIHRvIGJlIGZpbHRlcmVkXHJcbiAqIEBwYXJhbSB7SFRNTH0gaW5wdXQgLSBpbnB1dCBlbGVtZW50IHdob3NlIHZhbHVlIHdpbGwgYmUgdXNlZCB0byBmaWx0ZXJcclxuICogQHBhcmFtIHtTdHJpbmd9IHN0ZERpc3BsYXkgLSB0aGUgc3RhbmRhcmQgZGlzcGxheSB0aGUgJ2xpJyBzaG91bGQgaGF2ZSB3aGVuIG5vdCAnbm9uZSdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzZWFyY2hVbCAodWw6IEhUTUxVTGlzdEVsZW1lbnQsIGlucHV0OiBIVE1MSW5wdXRFbGVtZW50LCBzdGREaXNwbGF5OiBzdHJpbmcgPSAnZmxleCcpOiB2b2lkIHtcclxuICBjb25zdCBsaUVscyA9IHVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdsaScpXHJcbiAgY29uc3QgZmlsdGVyID0gaW5wdXQudmFsdWUudG9VcHBlckNhc2UoKVxyXG5cclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxpRWxzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAvLyBnZXQgdGhlIG5hbWUgY2hpbGQgZWwgaW4gdGhlIGxpIGVsXHJcbiAgICBjb25zdCBuYW1lID0gbGlFbHNbaV0uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWcuQ1NTLkNMQVNTRVMubmFtZSlbMF1cclxuICAgIGNvbnN0IG5hbWVUeHQgPSBuYW1lLnRleHRDb250ZW50IHx8IG5hbWUuaW5uZXJIVE1MXHJcblxyXG4gICAgaWYgKG5hbWVUeHQgJiYgbmFtZVR4dC50b1VwcGVyQ2FzZSgpLmluZGV4T2YoZmlsdGVyKSA+IC0xKSB7XHJcbiAgICAgIC8vIHNob3cgbGkncyB3aG9zZSBuYW1lIGNvbnRhaW5zIHRoZSB0aGUgZW50ZXJlZCBzdHJpbmdcclxuICAgICAgbGlFbHNbaV0uc3R5bGUuZGlzcGxheSA9IHN0ZERpc3BsYXlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIG90aGVyd2lzZSBoaWRlIGl0XHJcbiAgICAgIGxpRWxzW2ldLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVc2VzIGNhbnZhcy5tZWFzdXJlVGV4dCB0byBjb21wdXRlIGFuZCByZXR1cm4gdGhlIHdpZHRoIG9mIHRoZSBnaXZlbiB0ZXh0IG9mIGdpdmVuIGZvbnQgaW4gcGl4ZWxzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gdGV4dCBUaGUgdGV4dCB0byBiZSByZW5kZXJlZC5cclxuICogQHBhcmFtIHtTdHJpbmd9IGZvbnQgVGhlIGNzcyBmb250IGRlc2NyaXB0b3IgdGhhdCB0ZXh0IGlzIHRvIGJlIHJlbmRlcmVkIHdpdGggKGUuZy4gXCJib2xkIDE0cHggdmVyZGFuYVwiKS5cclxuICpcclxuICogQHNlZSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMTgyNDEvY2FsY3VsYXRlLXRleHQtd2lkdGgtd2l0aC1qYXZhc2NyaXB0LzIxMDE1MzkzIzIxMDE1MzkzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGV4dFdpZHRoICh0ZXh0OiBzdHJpbmcsIGZvbnQ6IHN0cmluZykge1xyXG4gIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXHJcbiAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXHJcbiAgbGV0IG1ldHJpY3M6IFRleHRNZXRyaWNzXHJcbiAgaWYgKGNvbnRleHQpIHtcclxuICAgIGNvbnRleHQuZm9udCA9IGZvbnRcclxuICAgIG1ldHJpY3MgPSBjb250ZXh0Lm1lYXN1cmVUZXh0KHRleHQpXHJcbiAgICByZXR1cm4gbWV0cmljcy53aWR0aFxyXG4gIH1cclxuXHJcbiAgdGhyb3cgbmV3IEVycm9yKCdObyBjb250ZXh0IG9uIGNyZWF0ZWQgY2FudmFzIHdhcyBmb3VuZCcpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0VsbGlwc2lzQWN0aXZlIChlbDogSFRNTEVsZW1lbnQpIHtcclxuICByZXR1cm4gZWwub2Zmc2V0V2lkdGggPCBlbC5zY3JvbGxXaWR0aFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2FwaXRhbGl6ZUZpcnN0TGV0dGVyIChzdHJpbmc6IHN0cmluZykge1xyXG4gIHJldHVybiBzdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHJpbmcuc2xpY2UoMSlcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFZhbGlkSW1hZ2UgKGltYWdlczogQXJyYXk8U3BvdGlmeUltZz4sIGlkeCA9IDApIHtcclxuICAvLyBvYnRhaW4gdGhlIGNvcnJlY3QgaW1hZ2VcclxuICBpZiAoaW1hZ2VzLmxlbmd0aCA+IGlkeCkge1xyXG4gICAgY29uc3QgaW1nID0gaW1hZ2VzW2lkeF1cclxuICAgIHJldHVybiBpbWcudXJsXHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiAnJ1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUFsbENoaWxkTm9kZXMgKHBhcmVudDogTm9kZSkge1xyXG4gIHdoaWxlIChwYXJlbnQuZmlyc3RDaGlsZCkge1xyXG4gICAgcGFyZW50LnJlbW92ZUNoaWxkKHBhcmVudC5maXJzdENoaWxkKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGFuaW1hdGlvbkNvbnRyb2wgPSAoZnVuY3Rpb24gKCkge1xyXG4gIC8qKiBBZGRzIGEgY2xhc3MgdG8gZWFjaCBlbGVtZW50IGNhdXNpbmcgYSB0cmFuc2l0aW9uIHRvIHRoZSBjaGFuZ2VkIGNzcyB2YWx1ZXMuXHJcbiAgICogVGhpcyBpcyBkb25lIG9uIHNldCBpbnRlcnZhbHMuXHJcbiAgICpcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBlbGVtZW50c1RvQW5pbWF0ZSAtIGNvbW1hIHNlcGFyYXRlZCBzdHJpbmcgY29udGFpbmluZyB0aGUgY2xhc3NlcyBvciBpZHMgb2YgZWxlbWVudHMgdG8gYW5pbWF0ZSBpbmNsdWRpbmcgcHJlZml4IGNoYXIuXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGNsYXNzVG9UcmFuc2l0aW9uVG9vIC0gVGhlIGNsYXNzIHRoYXQgYWxsIHRoZSB0cmFuc2l0aW9uaW5nIGVsZW1lbnRzIHdpbGwgYWRkXHJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGFuaW1hdGlvbkludGVydmFsIC0gVGhlIGludGVydmFsIHRvIHdhaXQgYmV0d2VlbiBhbmltYXRpb24gb2YgZWxlbWVudHNcclxuICAgKi9cclxuICBmdW5jdGlvbiBpbnRlcnZhbEVsZW1lbnRzVHJhbnNpdGlvbnMgKFxyXG4gICAgZWxlbWVudHNUb0FuaW1hdGU6IHN0cmluZyxcclxuICAgIGNsYXNzVG9UcmFuc2l0aW9uVG9vOiBzdHJpbmcsXHJcbiAgICBhbmltYXRpb25JbnRlcnZhbDogbnVtYmVyXHJcbiAgKSB7XHJcbiAgICAvLyBhcnIgb2YgaHRtbCBzZWxlY3RvcnMgdGhhdCBwb2ludCB0byBlbGVtZW50cyB0byBhbmltYXRlXHJcbiAgICBjb25zdCBhdHRyaWJ1dGVzID0gZWxlbWVudHNUb0FuaW1hdGUuc3BsaXQoJywnKVxyXG5cclxuICAgIGF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cikgPT4ge1xyXG4gICAgICBjb25zdCBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYXR0cilcclxuICAgICAgbGV0IGlkeCA9IDBcclxuICAgICAgLy8gaW4gaW50ZXJ2YWxzIHBsYXkgdGhlaXIgaW5pdGlhbCBhbmltYXRpb25zXHJcbiAgICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgIGlmIChpZHggPT09IGVsZW1lbnRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbClcclxuICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gZWxlbWVudHNbaWR4XVxyXG4gICAgICAgIC8vIGFkZCB0aGUgY2xhc3MgdG8gdGhlIGVsZW1lbnRzIGNsYXNzZXMgaW4gb3JkZXIgdG8gcnVuIHRoZSB0cmFuc2l0aW9uXHJcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzVG9UcmFuc2l0aW9uVG9vKVxyXG4gICAgICAgIGlkeCArPSAxXHJcbiAgICAgIH0sIGFuaW1hdGlvbkludGVydmFsKVxyXG4gICAgfSlcclxuICB9XHJcbiAgLyoqIEFuaW1hdGVzIGFsbCBlbGVtZW50cyB0aGF0IGNvbnRhaW4gYSBjZXJ0YWluIGNsYXNzIG9yIGlkXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gZWxlbWVudHNUb0FuaW1hdGUgLSBjb21tYSBzZXBhcmF0ZWQgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIGNsYXNzZXMgb3IgaWRzIG9mIGVsZW1lbnRzIHRvIGFuaW1hdGUgSU5DTFVESU5HIHByZWZpeCBjaGFyLlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjbGFzc1RvQWRkIC0gY2xhc3MgdG8gYWRkIEVYQ0xVRElORyB0aGUgcHJlZml4IGNoYXIuXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFuaW1hdGlvbkludGVydmFsIC0gdGhlIGludGVydmFsIHRvIGFuaW1hdGUgdGhlIGdpdmVuIGVsZW1lbnRzIGluIG1pbGxpc2Vjb25kcy5cclxuICAgKi9cclxuICBmdW5jdGlvbiBhbmltYXRlQXR0cmlidXRlcyAoZWxlbWVudHNUb0FuaW1hdGU6IHN0cmluZywgY2xhc3NUb0FkZDogc3RyaW5nLCBhbmltYXRpb25JbnRlcnZhbDogbnVtYmVyKSB7XHJcbiAgICBpbnRlcnZhbEVsZW1lbnRzVHJhbnNpdGlvbnMoXHJcbiAgICAgIGVsZW1lbnRzVG9BbmltYXRlLFxyXG4gICAgICBjbGFzc1RvQWRkLFxyXG4gICAgICBhbmltYXRpb25JbnRlcnZhbFxyXG4gICAgKVxyXG4gIH1cclxuICByZXR1cm4ge1xyXG4gICAgYW5pbWF0ZUF0dHJpYnV0ZXNcclxuICB9XHJcbn0pKClcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQaXhlbFBvc0luRWxPbkNsaWNrIChtb3VzZUV2dDogTW91c2VFdmVudCk6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB7XHJcbiAgY29uc3QgcmVjdCA9IChtb3VzZUV2dC50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXHJcbiAgY29uc3QgeCA9IG1vdXNlRXZ0LmNsaWVudFggLSByZWN0LmxlZnQgLy8geCBwb3NpdGlvbiB3aXRoaW4gdGhlIGVsZW1lbnQuXHJcbiAgY29uc3QgeSA9IG1vdXNlRXZ0LmNsaWVudFkgLSByZWN0LnRvcCAvLyB5IHBvc2l0aW9uIHdpdGhpbiB0aGUgZWxlbWVudC5cclxuICByZXR1cm4geyB4LCB5IH1cclxufVxyXG5mdW5jdGlvbiBkcmFnTW92ZUxpc3RlbmVyIChldnQ6IEludGVyYWN0LkludGVyYWN0RXZlbnQpIHtcclxuICBjb25zdCB0YXJnZXQgPSBldnQudGFyZ2V0XHJcbiAgLy8ga2VlcCB0aGUgZHJhZ2dlZCBwb3NpdGlvbiBpbiB0aGUgZGF0YS14L2RhdGEteSBhdHRyaWJ1dGVzXHJcbiAgaWYgKHRhcmdldCA9PT0gbnVsbCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnRlcmFjdGpzIEV2ZW50IGRvZXMgbm90IGNvbnRhaW4gdGFyZ2V0JylcclxuICB9XHJcbiAgbGV0IHggPSAwXHJcbiAgbGV0IHkgPSAwXHJcblxyXG4gIGNvbnN0IGRhdGFYID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS14JylcclxuICBjb25zdCBkYXRhWSA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteScpXHJcblxyXG4gIGlmICh0eXBlb2YgZGF0YVggPT09ICdzdHJpbmcnICYmIHR5cGVvZiBkYXRhWSA9PT0gJ3N0cmluZycpIHtcclxuICAgIHggPSBwYXJzZUZsb2F0KGRhdGFYKSArIGV2dC5keFxyXG4gICAgeSA9IHBhcnNlRmxvYXQoZGF0YVkpICsgZXZ0LmR5XHJcbiAgfSBlbHNlIHtcclxuICAgIHggKz0gZXZ0LmR4XHJcbiAgICB5ICs9IGV2dC5keVxyXG4gIH1cclxuXHJcbiAgLy8gdHJhbnNsYXRlIHRoZSBlbGVtZW50XHJcbiAgdGFyZ2V0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIHggKyAncHgsICcgKyB5ICsgJ3B4KSdcclxuXHJcbiAgLy8gdXBkYXRlIHRoZSBwb3NpaW9uIGF0dHJpYnV0ZXNcclxuICB0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXgnLCB4LnRvU3RyaW5nKCkpXHJcbiAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS15JywgeS50b1N0cmluZygpKVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBhZGRSZXNpemVEcmFnICgpIHtcclxuICBpbnRlcmFjdCgnLnJlc2l6ZS1kcmFnJylcclxuICAgIC5yZXNpemFibGUoe1xyXG4gICAgICAvLyByZXNpemUgZnJvbSBhbGwgZWRnZXMgYW5kIGNvcm5lcnNcclxuICAgICAgZWRnZXM6IHsgbGVmdDogdHJ1ZSwgcmlnaHQ6IHRydWUsIGJvdHRvbTogdHJ1ZSwgdG9wOiB0cnVlIH0sXHJcblxyXG4gICAgICBsaXN0ZW5lcnM6IHtcclxuICAgICAgICBtb3ZlIChldnQpIHtcclxuICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGV2dC50YXJnZXRcclxuICAgICAgICAgIGxldCB4ID0gcGFyc2VGbG9hdCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXgnKSkgfHwgMFxyXG4gICAgICAgICAgbGV0IHkgPSBwYXJzZUZsb2F0KHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteScpKSB8fCAwXHJcblxyXG4gICAgICAgICAgLy8gdXBkYXRlIHRoZSBlbGVtZW50J3Mgc3R5bGVcclxuICAgICAgICAgIHRhcmdldC5zdHlsZS53aWR0aCA9IGV2dC5yZWN0LndpZHRoICsgJ3B4J1xyXG4gICAgICAgICAgdGFyZ2V0LnN0eWxlLmhlaWdodCA9IGV2dC5yZWN0LmhlaWdodCArICdweCdcclxuXHJcbiAgICAgICAgICAvLyB0cmFuc2xhdGUgd2hlbiByZXNpemluZyBmcm9tIHRvcCBvciBsZWZ0IGVkZ2VzXHJcbiAgICAgICAgICB4ICs9IGV2dC5kZWx0YVJlY3QubGVmdFxyXG4gICAgICAgICAgeSArPSBldnQuZGVsdGFSZWN0LnRvcFxyXG5cclxuICAgICAgICAgIHRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyB4ICsgJ3B4LCcgKyB5ICsgJ3B4KSdcclxuXHJcbiAgICAgICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKCdkYXRhLXgnLCB4KVxyXG4gICAgICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS15JywgeSlcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIG1vZGlmaWVyczogW1xyXG4gICAgICAgIC8vIGtlZXAgdGhlIGVkZ2VzIGluc2lkZSB0aGUgcGFyZW50XHJcbiAgICAgICAgaW50ZXJhY3QubW9kaWZpZXJzLnJlc3RyaWN0RWRnZXMoe1xyXG4gICAgICAgICAgb3V0ZXI6ICdwYXJlbnQnXHJcbiAgICAgICAgfSksXHJcblxyXG4gICAgICAgIC8vIG1pbmltdW0gc2l6ZVxyXG4gICAgICAgIGludGVyYWN0Lm1vZGlmaWVycy5yZXN0cmljdFNpemUoe1xyXG4gICAgICAgICAgbWluOiB7IHdpZHRoOiAxMDAsIGhlaWdodDogNTAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgIF0sXHJcblxyXG4gICAgICBpbmVydGlhOiBmYWxzZVxyXG4gICAgfSlcclxuICAgIC5kcmFnZ2FibGUoe1xyXG4gICAgICBsaXN0ZW5lcnM6IHsgbW92ZTogZHJhZ01vdmVMaXN0ZW5lciB9LFxyXG4gICAgICBpbmVydGlhOiB0cnVlLFxyXG4gICAgICBtb2RpZmllcnM6IFtcclxuICAgICAgICBpbnRlcmFjdC5tb2RpZmllcnMucmVzdHJpY3RSZWN0KHtcclxuICAgICAgICAgIHJlc3RyaWN0aW9uOiAncGFyZW50JyxcclxuICAgICAgICAgIGVuZE9ubHk6IGZhbHNlXHJcbiAgICAgICAgfSlcclxuICAgICAgXVxyXG4gICAgfSlcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRocm93RXhwcmVzc2lvbiAoZXJyb3JNZXNzYWdlOiBzdHJpbmcpOiBuZXZlciB7XHJcbiAgdGhyb3cgbmV3IEVycm9yKGVycm9yTWVzc2FnZSlcclxufVxyXG4iLCJpbXBvcnQgeyBjb25maWcsIHByb21pc2VIYW5kbGVyIH0gZnJvbSAnLi9jb25maWcnXHJcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcydcclxuXHJcbmNvbnN0IEhBTEZfSE9VUiA9IDEuOGU2IC8qIDMwIG1pbiBpbiBtcyAqL1xyXG5cclxudHlwZSBIYXNUb2tlblJlcyA9IHtcclxuICBkYXRhOiBib29sZWFuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzVG9rZW5SZXMgKHJlczogYW55KTogcmVzIGlzIEhhc1Rva2VuUmVzIHtcclxuICByZXR1cm4gdHlwZW9mIHJlcy5kYXRhID09PSAnYm9vbGVhbidcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoZWNrSWZIYXNUb2tlbnMgKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gIC8vIGlmIHRoZSB1c2VyIHN0YXlzIG9uIHRoZSBzYW1lIHBhZ2UgZm9yIDMwIG1pbiByZWZyZXNoIHRoZSB0b2tlbi5cclxuICBjb25zdCBzdGFydFJlZnJlc2hJbnRlcnZhbCA9ICgpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKCdzdGFydCBpbnRlcnZhbCByZWZyZXNoJylcclxuICAgIHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgcHJvbWlzZUhhbmRsZXIoYXhpb3MucHV0KGNvbmZpZy5VUkxzLnB1dFJlZnJlc2hBY2Nlc3NUb2tlbikpXHJcbiAgICAgIGNvbnNvbGUubG9nKCdyZWZyZXNoIGFzeW5jJylcclxuICAgIH0sIEhBTEZfSE9VUilcclxuICB9XHJcbiAgbGV0IGhhc1Rva2VuID0gZmFsc2VcclxuICAvLyBhd2FpdCBwcm9taXNlIHJlc29sdmUgdGhhdCByZXR1cm5zIHdoZXRoZXIgdGhlIHNlc3Npb24gaGFzIHRva2Vucy5cclxuICAvLyBiZWNhdXNlIHRva2VuIGlzIHN0b3JlZCBpbiBzZXNzaW9uIHdlIG5lZWQgdG8gcmVhc3NpZ24gJ2hhc1Rva2VuJyB0byB0aGUgY2xpZW50IHNvIHdlIGRvIG5vdCBuZWVkIHRvIHJ1biB0aGlzIG1ldGhvZCBhZ2FpbiBvbiByZWZyZXNoXHJcbiAgYXdhaXQgcHJvbWlzZUhhbmRsZXIoXHJcbiAgICBheGlvcy5nZXQoY29uZmlnLlVSTHMuZ2V0SGFzVG9rZW5zKSxcclxuICAgIChyZXMpID0+IHtcclxuICAgICAgaWYgKCFpc1Rva2VuUmVzKHJlcykpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaGFzIHRva2VuIHJlc3BvbnNlJylcclxuICAgICAgfVxyXG5cclxuICAgICAgaGFzVG9rZW4gPSByZXMuZGF0YVxyXG4gICAgfVxyXG4gIClcclxuXHJcbiAgaWYgKGhhc1Rva2VuKSB7XHJcbiAgICBzdGFydFJlZnJlc2hJbnRlcnZhbCgpXHJcbiAgfVxyXG4gIHJldHVybiBoYXNUb2tlblxyXG59XHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUb2tlbnMgKG9uTm9Ub2tlbjogKCkgPT4gdm9pZCkge1xyXG4gIGxldCBoYXNUb2tlbiA9IGZhbHNlXHJcbiAgLy8gY3JlYXRlIGEgcGFyYW1ldGVyIHNlYXJjaGVyIGluIHRoZSBVUkwgYWZ0ZXIgJz8nIHdoaWNoIGhvbGRzIHRoZSByZXF1ZXN0cyBib2R5IHBhcmFtZXRlcnNcclxuICBjb25zdCB1cmxQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpXHJcblxyXG4gIC8vIEdldCB0aGUgY29kZSBmcm9tIHRoZSBwYXJhbWV0ZXIgY2FsbGVkICdjb2RlJyBpbiB0aGUgdXJsIHdoaWNoXHJcbiAgLy8gaG9wZWZ1bGx5IGNhbWUgYmFjayBmcm9tIHRoZSBzcG90aWZ5IEdFVCByZXF1ZXN0IG90aGVyd2lzZSBpdCBpcyBudWxsXHJcbiAgbGV0IGF1dGhDb2RlID0gdXJsUGFyYW1zLmdldCgnY29kZScpXHJcblxyXG4gIGlmIChhdXRoQ29kZSkge1xyXG4gICAgYXdhaXQgcHJvbWlzZUhhbmRsZXIoXHJcbiAgICAgIGF4aW9zLmdldChjb25maWcuVVJMcy5nZXRPYnRhaW5Ub2tlbnNQcmVmaXgoYXV0aENvZGUpKSwgLy8gbm8gbmVlZCB0byBzcGVjaWZ5IHR5cGUgYXMgbm8gdHlwZSB2YWx1ZSBpcyB1c2VkLlxyXG5cclxuICAgICAgLy8gaWYgdGhlIHJlcXVlc3Qgd2FzIHN1Y2Nlc2Z1bCB3ZSBoYXZlIHJlY2lldmVkIGEgdG9rZW5cclxuICAgICAgKCkgPT4gKGhhc1Rva2VuID0gdHJ1ZSlcclxuICAgIClcclxuICAgIGF1dGhDb2RlID0gJydcclxuICB9IGVsc2Uge1xyXG4gICAgb25Ob1Rva2VuKClcclxuICB9XHJcblxyXG4gIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZShudWxsLCAnJywgJy8nKVxyXG4gIHJldHVybiBoYXNUb2tlblxyXG59XHJcblxyXG4vKiogR2VuZXJhdGUgYSBsb2dpbi9jaGFuZ2UgYWNjb3VudCBsaW5rLiBEZWZhdWx0cyB0byBhcHBlbmRpbmcgaXQgb250byB0aGUgbmF2IGJhci5cclxuICpcclxuICogQHBhcmFtIHtBcnJheTxTdHJpbmc+fSBjbGFzc2VzVG9BZGQgLSB0aGUgY2xhc3NlcyB0byBhZGQgb250byB0aGUgbGluay5cclxuICogQHBhcmFtIHtCb29sZWFufSBjaGFuZ2VBY2NvdW50IC0gV2hldGhlciB0aGUgbGluayBzaG91bGQgYmUgZm9yIGNoYW5naW5nIGFjY291bnQsIG9yIGZvciBsb2dnaW5nIGluLiAoZGVmYXVsdHMgdG8gdHJ1ZSlcclxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyZW50RWwgLSB0aGUgcGFyZW50IGVsZW1lbnQgdG8gYXBwZW5kIHRoZSBsaW5rIG9udG8uIChkZWZhdWx0cyB0byBuYXZiYXIpXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVMb2dpbiAoe1xyXG4gIGNsYXNzZXNUb0FkZCA9IFsncmlnaHQnXSxcclxuICBjaGFuZ2VBY2NvdW50ID0gdHJ1ZSxcclxuICBwYXJlbnRFbCA9IGRvY3VtZW50XHJcbiAgICAuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgndG9wbmF2JylbMF1cclxuICAgIC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdyaWdodCcpWzBdXHJcbiAgICAuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZHJvcGRvd24tY29udGVudCcpWzBdXHJcbn0gPSB7fSkge1xyXG4gIC8vIENyZWF0ZSBhbmNob3IgZWxlbWVudC5cclxuICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXHJcbiAgYS5ocmVmID0gY29uZmlnLlVSTHMuYXV0aFxyXG5cclxuICAvLyBDcmVhdGUgdGhlIHRleHQgbm9kZSBmb3IgYW5jaG9yIGVsZW1lbnQuXHJcbiAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFxyXG4gICAgY2hhbmdlQWNjb3VudCA/ICdDaGFuZ2UgQWNjb3VudCcgOiAnTG9naW4gVG8gU3BvdGlmeSdcclxuICApXHJcblxyXG4gIC8vIEFwcGVuZCB0aGUgdGV4dCBub2RlIHRvIGFuY2hvciBlbGVtZW50LlxyXG4gIGEuYXBwZW5kQ2hpbGQobGluaylcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGNsYXNzZXNUb0FkZC5sZW5ndGg7IGkrKykge1xyXG4gICAgY29uc3QgY2xhc3NUb0FkZCA9IGNsYXNzZXNUb0FkZFtpXVxyXG4gICAgYS5jbGFzc0xpc3QuYWRkKGNsYXNzVG9BZGQpXHJcbiAgfVxyXG5cclxuICAvLyBjbGVhciBjdXJyZW50IHRva2VucyB3aGVuIGNsaWNrZWRcclxuICBhLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgYXhpb3MucHV0KGNvbmZpZy5VUkxzLnB1dENsZWFyVG9rZW5zKS5jYXRjaCgoZXJyKSA9PiBjb25zb2xlLmVycm9yKGVycikpXHJcbiAgfSlcclxuXHJcbiAgLy8gQXBwZW5kIHRoZSBhbmNob3IgZWxlbWVudCB0byB0aGUgcGFyZW50LlxyXG4gIHBhcmVudEVsLmFwcGVuZENoaWxkKGEpXHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIG9uU3VjY2Vzc2Z1bFRva2VuQ2FsbCAoXHJcbiAgaGFzVG9rZW46IGJvb2xlYW4sXHJcbiAgaGFzVG9rZW5DYWxsYmFjayA9ICgpID0+IHsgfSxcclxuICBub1Rva2VuQ2FsbEJhY2sgPSAoKSA9PiB7IH1cclxuKSB7XHJcbiAgY29uc3QgZ2V0VG9rZW5zU3Bpbm5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxyXG4gICAgY29uZmlnLkNTUy5JRHMuZ2V0VG9rZW5Mb2FkaW5nU3Bpbm5lclxyXG4gIClcclxuXHJcbiAgLy8gcmVtb3ZlIHRva2VuIHNwaW5uZXIgYmVjYXVzZSBieSB0aGlzIGxpbmUgd2UgaGF2ZSBvYnRhaW5lZCB0aGUgdG9rZW5cclxuICBnZXRUb2tlbnNTcGlubmVyPy5wYXJlbnROb2RlPy5yZW1vdmVDaGlsZChnZXRUb2tlbnNTcGlubmVyKVxyXG5cclxuICBjb25zdCBpbmZvQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMuaW5mb0NvbnRhaW5lcilcclxuICBpZiAoaGFzVG9rZW4pIHtcclxuICAgIC8vIGdlbmVyYXRlIHRoZSBuYXYgbG9naW5cclxuICAgIGdlbmVyYXRlTG9naW4oKVxyXG4gICAgaWYgKGluZm9Db250YWluZXIgPT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0luZm8gY29udGFpbmVyIEVsZW1lbnQgZG9lcyBub3QgZXhpc3QnKVxyXG4gICAgfVxyXG4gICAgaW5mb0NvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xyXG4gICAgaGFzVG9rZW5DYWxsYmFjaygpXHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIGlmIHRoZXJlIGlzIG5vIHRva2VuIHJlZGlyZWN0IHRvIGFsbG93IGFjY2VzcyBwYWdlXHJcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGNvbmZpZy5VUkxzLnNpdGVVcmxcclxuICAgIG5vVG9rZW5DYWxsQmFjaygpXHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBBcnRpc3QsIHsgZ2VuZXJhdGVBcnRpc3RzRnJvbURhdGEgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2FydGlzdCdcclxuaW1wb3J0IHtcclxuICBjb25maWcsXHJcbiAgcHJvbWlzZUhhbmRsZXIsXHJcbiAgaHRtbFRvRWwsXHJcbiAgcmVtb3ZlQWxsQ2hpbGROb2RlcyxcclxuICBhbmltYXRpb25Db250cm9sLFxyXG4gIHRocm93RXhwcmVzc2lvblxyXG59IGZyb20gJy4uLy4uL2NvbmZpZydcclxuaW1wb3J0IFNlbGVjdGFibGVUYWJFbHMgZnJvbSAnLi4vLi4vY29tcG9uZW50cy9TZWxlY3RhYmxlVGFiRWxzJ1xyXG5pbXBvcnQge1xyXG4gIGNoZWNrSWZIYXNUb2tlbnMsXHJcbiAgb25TdWNjZXNzZnVsVG9rZW5DYWxsXHJcbn0gZnJvbSAnLi4vLi4vbWFuYWdlLXRva2VucydcclxuaW1wb3J0IEFzeW5jU2VsZWN0aW9uVmVyaWYgZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hc3luY1NlbGVjdGlvblZlcmlmJ1xyXG5pbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnXHJcblxyXG5jb25zdCBNQVhfVklFV0FCTEVfQ0FSRFMgPSA1XHJcblxyXG5jb25zdCBhcnRpc3RBY3Rpb25zID0gKGZ1bmN0aW9uICgpIHtcclxuICBjb25zdCBzZWxlY3Rpb25zID0ge1xyXG4gICAgbnVtVmlld2FibGVDYXJkczogTUFYX1ZJRVdBQkxFX0NBUkRTLFxyXG4gICAgdGVybTogJ3Nob3J0X3Rlcm0nXHJcbiAgfVxyXG4gIGZ1bmN0aW9uIGxvYWRBcnRpc3RUb3BUcmFja3MgKGFydGlzdE9iajogQXJ0aXN0LCBjYWxsYmFjazogRnVuY3Rpb24pIHtcclxuICAgIGFydGlzdE9ialxyXG4gICAgICAubG9hZFRvcFRyYWNrcygpXHJcbiAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICBjYWxsYmFjaygpXHJcbiAgICAgIH0pXHJcbiAgICAgIC5jYXRjaCgoZXJyOiB1bmtub3duKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yIHdoZW4gbG9hZGluZyBhcnRpc3RzJylcclxuICAgICAgICBjb25zb2xlLmVycm9yKGVycilcclxuICAgICAgfSlcclxuICB9XHJcbiAgZnVuY3Rpb24gc2hvd1RvcFRyYWNrcyAoYXJ0aXN0T2JqOiBBcnRpc3QpIHtcclxuICAgIGxvYWRBcnRpc3RUb3BUcmFja3MoYXJ0aXN0T2JqLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHRyYWNrTGlzdCA9IGdldFRvcFRyYWNrc1VsRnJvbUFydGlzdChhcnRpc3RPYmopXHJcbiAgICAgIGxldCByYW5rID0gMVxyXG4gICAgICBpZiAoYXJ0aXN0T2JqLnRvcFRyYWNrcyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgdGhyb3dFeHByZXNzaW9uKCdhcnRpc3QgZG9lcyBub3QgaGF2ZSB0b3AgdHJhY2tzIGxvYWRlZCBvbiByZXF1ZXN0IHRvIHNob3cgdGhlbScpXHJcbiAgICAgIH1cclxuICAgICAgZm9yIChjb25zdCB0cmFjayBvZiBhcnRpc3RPYmoudG9wVHJhY2tzLnZhbHVlcygpKSB7XHJcbiAgICAgICAgdHJhY2tMaXN0LmFwcGVuZENoaWxkKHRyYWNrLmdldFJhbmtlZFRyYWNrSHRtbChhcnRpc3RPYmoudG9wVHJhY2tzLCByYW5rKSlcclxuICAgICAgICByYW5rKytcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldFRvcFRyYWNrc1VsRnJvbUFydGlzdCAoYXJ0aXN0T2JqOiBBcnRpc3QpIHtcclxuICAgIGNvbnN0IGFydGlzdENhcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChhcnRpc3RPYmouY2FyZElkKSA/PyB0aHJvd0V4cHJlc3Npb24oJ2FydGlzdCBjYXJkIGRvZXMgbm90IGV4aXN0JylcclxuICAgIGNvbnN0IHRyYWNrTGlzdCA9IGFydGlzdENhcmQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWcuQ1NTLkNMQVNTRVMudHJhY2tMaXN0KVswXVxyXG5cclxuICAgIGlmICh0cmFja0xpc3QgPT09IG51bGwpIHtcclxuICAgICAgdGhyb3dFeHByZXNzaW9uKGB0cmFjayB1bCBvbiBhcnRpc3QgZWxlbWVudCB3aXRoIGlkICR7YXJ0aXN0T2JqLmNhcmRJZH0gZG9lcyBub3QgZXhpc3RgKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRyYWNrTGlzdFxyXG4gIH1cclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gcmV0cmlldmVBcnRpc3RzIChhcnRpc3RBcnI6IEFycmF5PEFydGlzdD4pIHtcclxuICAgIGNvbnN0IHsgcmVzLCBlcnIgfSA9IGF3YWl0IHByb21pc2VIYW5kbGVyKFxyXG4gICAgICBheGlvcy5nZXQoY29uZmlnLlVSTHMuZ2V0VG9wQXJ0aXN0cyArIHNlbGVjdGlvbnMudGVybSlcclxuICAgIClcclxuICAgIGlmIChlcnIpIHtcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICAvLyB3ZSBrbm93IHJlcyBpcyBub3QgbnVsbCBiZWNhdXNlIGl0IGlzIG9ubHkgbnVsbCBpZiBhbiBlcnJvciBleGlzdHMgaW4gd2hpY2ggd2UgaGF2ZSBhbHJlYWR5IHJldHVybmVkXHJcbiAgICBnZW5lcmF0ZUFydGlzdHNGcm9tRGF0YShyZXMhLmRhdGEsIGFydGlzdEFycilcclxuICB9XHJcbiAgZnVuY3Rpb24gZ2V0Q3VyclNlbFRvcEFydGlzdHMgKCkge1xyXG4gICAgaWYgKHNlbGVjdGlvbnMudGVybSA9PT0gJ3Nob3J0X3Rlcm0nKSB7XHJcbiAgICAgIHJldHVybiBhcnRpc3RBcnJzLnRvcEFydGlzdE9ianNTaG9ydFRlcm1cclxuICAgIH0gZWxzZSBpZiAoc2VsZWN0aW9ucy50ZXJtID09PSAnbWVkaXVtX3Rlcm0nKSB7XHJcbiAgICAgIHJldHVybiBhcnRpc3RBcnJzLnRvcEFydGlzdE9ianNNaWRUZXJtXHJcbiAgICB9IGVsc2UgaWYgKHNlbGVjdGlvbnMudGVybSA9PT0gJ2xvbmdfdGVybScpIHtcclxuICAgICAgcmV0dXJuIGFydGlzdEFycnMudG9wQXJ0aXN0T2Jqc0xvbmdUZXJtXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlbGVjdGVkIHRyYWNrIHRlcm0gaXMgaW52YWxpZCAnICsgc2VsZWN0aW9ucy50ZXJtKVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4ge1xyXG4gICAgc2hvd1RvcFRyYWNrcyxcclxuICAgIHJldHJpZXZlQXJ0aXN0cyxcclxuICAgIHNlbGVjdGlvbnMsXHJcbiAgICBnZXRDdXJyU2VsVG9wQXJ0aXN0c1xyXG4gIH1cclxufSkoKVxyXG5cclxuY29uc3QgYXJ0aXN0Q2FyZHNIYW5kbGVyID0gKGZ1bmN0aW9uICgpIHtcclxuICBjb25zdCBzZWxlY3Rpb25WZXJpZiA9IG5ldyBBc3luY1NlbGVjdGlvblZlcmlmPEFycmF5PEFydGlzdD4+KClcclxuICBjb25zdCBhcnRpc3RDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcclxuICAgIGNvbmZpZy5DU1MuSURzLmFydGlzdENhcmRzQ29udGFpbmVyXHJcbiAgKSA/PyB0aHJvd0V4cHJlc3Npb24oYGFydGlzdCBjb250YWluZXIgb2YgaWQgJHtjb25maWcuQ1NTLklEcy5hcnRpc3RDYXJkc0NvbnRhaW5lcn0gZG9lcyBub3QgZXhpc3RgKVxyXG5cclxuICAvKiogR2VuZXJhdGVzIHRoZSBjYXJkcyB0byB0aGUgRE9NIHRoZW4gbWFrZXMgdGhlbSB2aXNpYmxlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0FycmF5PEFydGlzdD59IGFydGlzdEFyciBhcnJheSBvZiB0cmFjayBvYmplY3RzIHdob3NlIGNhcmRzIHNob3VsZCBiZSBnZW5lcmF0ZWQuXHJcbiAgICogQHBhcmFtIHtCb29sZWFufSBhdXRvQXBwZWFyIHdoZXRoZXIgdG8gc2hvdyB0aGUgY2FyZCB3aXRob3V0IGFuaW1hdGlvbiBvciB3aXRoIGFuaW1hdGlvbi5cclxuICAgKiBAcmV0dXJucyB7QXJyYXk8SFRNTEVsZW1lbnQ+fSBhcnJheSBvZiB0aGUgY2FyZCBlbGVtZW50cy5cclxuICAgKi9cclxuICBmdW5jdGlvbiBnZW5lcmF0ZUNhcmRzIChhcnRpc3RBcnI6IEFycmF5PEFydGlzdD4sIGF1dG9BcHBlYXI6IEJvb2xlYW4pIHtcclxuICAgIHJlbW92ZUFsbENoaWxkTm9kZXMoYXJ0aXN0Q29udGFpbmVyKVxyXG4gICAgLy8gZmlsbCBhcnIgb2YgY2FyZCBlbGVtZW50cyBhbmQgYXBwZW5kIHRoZW0gdG8gRE9NXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFydGlzdEFyci5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoaSA8IGFydGlzdEFjdGlvbnMuc2VsZWN0aW9ucy5udW1WaWV3YWJsZUNhcmRzKSB7XHJcbiAgICAgICAgY29uc3QgYXJ0aXN0T2JqID0gYXJ0aXN0QXJyW2ldXHJcbiAgICAgICAgY29uc3QgY2FyZEh0bWwgPSBhcnRpc3RPYmouZ2V0QXJ0aXN0SHRtbChpKVxyXG5cclxuICAgICAgICBhcnRpc3RDb250YWluZXIuYXBwZW5kQ2hpbGQoY2FyZEh0bWwgYXMgTm9kZSlcclxuXHJcbiAgICAgICAgYXJ0aXN0QWN0aW9ucy5zaG93VG9wVHJhY2tzKGFydGlzdE9iailcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBicmVha1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoIWF1dG9BcHBlYXIpIHtcclxuICAgICAgYW5pbWF0aW9uQ29udHJvbC5hbmltYXRlQXR0cmlidXRlcyhcclxuICAgICAgICAnLicgKyBjb25maWcuQ1NTLkNMQVNTRVMuYXJ0aXN0LFxyXG4gICAgICAgIGNvbmZpZy5DU1MuQ0xBU1NFUy5hcHBlYXIsXHJcbiAgICAgICAgMjVcclxuICAgICAgKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIEJlZ2lucyByZXRyaWV2aW5nIGFydGlzdHMgdGhlbiB3aGVuIGRvbmUgdmVyaWZpZXMgaXQgaXMgdGhlIGNvcnJlY3Qgc2VsZWN0ZWQgYXJ0aXN0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheTxBcnRpc3Q+fSBhcnRpc3RBcnIgYXJyYXkgdG8gbG9hZCBhcnRpc3RzIGludG8uXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gc3RhcnRMb2FkaW5nQXJ0aXN0cyAoYXJ0aXN0QXJyOiBBcnJheTxBcnRpc3Q+KSB7XHJcbiAgICAvLyBpbml0aWFsbHkgc2hvdyB0aGUgbG9hZGluZyBzcGlubmVyXHJcbiAgICBjb25zdCBodG1sU3RyaW5nID0gYFxyXG4gICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgIDxpbWcgc3JjPVwiJHtjb25maWcuUEFUSFMuc3Bpbm5lcn1cIiBhbHQ9XCJMb2FkaW5nLi4uXCIgLz5cclxuICAgICAgICAgICAgPC9kaXY+YFxyXG4gICAgY29uc3Qgc3Bpbm5lckVsID0gaHRtbFRvRWwoaHRtbFN0cmluZylcclxuXHJcbiAgICByZW1vdmVBbGxDaGlsZE5vZGVzKGFydGlzdENvbnRhaW5lcilcclxuICAgIGFydGlzdENvbnRhaW5lci5hcHBlbmRDaGlsZChzcGlubmVyRWwgYXMgTm9kZSlcclxuXHJcbiAgICBhcnRpc3RBY3Rpb25zLnJldHJpZXZlQXJ0aXN0cyhhcnRpc3RBcnIpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAvLyBhZnRlciByZXRyaWV2aW5nIGFzeW5jIHZlcmlmeSBpZiBpdCBpcyB0aGUgc2FtZSBhcnIgb2YgQXJ0aXN0J3MgYXMgd2hhdCB3YXMgc2VsZWN0ZWRcclxuICAgICAgaWYgKCFzZWxlY3Rpb25WZXJpZi5pc1ZhbGlkKGFydGlzdEFycikpIHtcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZ2VuZXJhdGVDYXJkcyhhcnRpc3RBcnIsIGZhbHNlKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIC8qKiBMb2FkIGFydGlzdCBvYmplY3RzIGlmIG5vdCBsb2FkZWQsIHRoZW4gZ2VuZXJhdGUgY2FyZHMgd2l0aCB0aGUgb2JqZWN0cy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QXJyYXk8QXJ0aXN0Pn0gYXJ0aXN0QXJyIC0gTGlzdCBvZiB0cmFjayBvYmplY3RzIHdob3NlIGNhcmRzIHNob3VsZCBiZSBnZW5lcmF0ZWQgb3JcclxuICAgKiBlbXB0eSBsaXN0IHRoYXQgc2hvdWxkIGJlIGZpbGxlZCB3aGVuIGxvYWRpbmcgdHJhY2tzLlxyXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gYXV0b0FwcGVhciB3aGV0aGVyIHRvIHNob3cgdGhlIGNhcmRzIHdpdGhvdXQgYW5pbWF0aW9uLlxyXG4gICAqIEByZXR1cm5zIHtBcnJheTxIVE1MRWxlbWVudD59IGxpc3Qgb2YgQ2FyZCBIVE1MRWxlbWVudCdzLlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGRpc3BsYXlBcnRpc3RDYXJkcyAoYXJ0aXN0QXJyOiBBcnJheTxBcnRpc3Q+LCBhdXRvQXBwZWFyID0gZmFsc2UpIHtcclxuICAgIHNlbGVjdGlvblZlcmlmLnNlbGVjdGlvbkNoYW5nZWQoYXJ0aXN0QXJyKVxyXG4gICAgaWYgKGFydGlzdEFyci5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGdlbmVyYXRlQ2FyZHMoYXJ0aXN0QXJyLCBhdXRvQXBwZWFyKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc3RhcnRMb2FkaW5nQXJ0aXN0cyhhcnRpc3RBcnIpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgZGlzcGxheUFydGlzdENhcmRzXHJcbiAgfVxyXG59KSgpXHJcblxyXG5jb25zdCBhcnRpc3RBcnJzID0gKGZ1bmN0aW9uICgpIHtcclxuICBjb25zdCB0b3BBcnRpc3RPYmpzU2hvcnRUZXJtOiBBcnJheTxBcnRpc3Q+ID0gW11cclxuICBjb25zdCB0b3BBcnRpc3RPYmpzTWlkVGVybTogQXJyYXk8QXJ0aXN0PiA9IFtdXHJcbiAgY29uc3QgdG9wQXJ0aXN0T2Jqc0xvbmdUZXJtOiBBcnJheTxBcnRpc3Q+ID0gW11cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHRvcEFydGlzdE9ianNTaG9ydFRlcm0sXHJcbiAgICB0b3BBcnRpc3RPYmpzTWlkVGVybSxcclxuICAgIHRvcEFydGlzdE9ianNMb25nVGVybVxyXG4gIH1cclxufSkoKVxyXG5cclxuY29uc3QgYWRkRXZlbnRMaXN0ZW5lcnMgPSAoZnVuY3Rpb24gKCkge1xyXG4gIGNvbnN0IGFydGlzdFRlcm1TZWxlY3Rpb25zID0gZG9jdW1lbnRcclxuICAgIC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy5hcnRpc3RUZXJtU2VsZWN0aW9ucykgPz8gdGhyb3dFeHByZXNzaW9uKGB0ZXJtIHNlbGVjdGlvbiBvZiBpZCAke2NvbmZpZy5DU1MuSURzLmFydGlzdFRlcm1TZWxlY3Rpb25zfSBkb2VzIG5vdCBleGlzdGApXHJcbiAgY29uc3Qgc2VsZWN0aW9ucyA9IHtcclxuICAgIHRlcm1UYWJNYW5hZ2VyOiBuZXcgU2VsZWN0YWJsZVRhYkVscyhcclxuICAgICAgYXJ0aXN0VGVybVNlbGVjdGlvbnMuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2J1dHRvbicpWzBdLCAvLyBmaXJzdCB0YWIgaXMgc2VsZWN0ZWQgZmlyc3QgYnkgZGVmYXVsdFxyXG4gICAgICBhcnRpc3RUZXJtU2VsZWN0aW9ucy5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNvbmZpZy5DU1MuQ0xBU1NFUy5ib3JkZXJDb3ZlcilbMF0gLy8gZmlyc3QgdGFiIGlzIHNlbGVjdGVkIGZpcnN0IGJ5IGRlZmF1bHRcclxuICAgIClcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZEFydGlzdFRlcm1CdXR0b25FdmVudHMgKCkge1xyXG4gICAgZnVuY3Rpb24gb25DbGljayAoYnRuOiBFbGVtZW50LCBib3JkZXJDb3ZlcjogRWxlbWVudCkge1xyXG4gICAgICBjb25zdCBhdHRyID0gYnRuLmdldEF0dHJpYnV0ZShcclxuICAgICAgICBjb25maWcuQ1NTLkFUVFJJQlVURVMuZGF0YVNlbGVjdGlvblxyXG4gICAgICApXHJcbiAgICAgIGlmIChhdHRyID09PSBudWxsKSB7XHJcbiAgICAgICAgdGhyb3dFeHByZXNzaW9uKGBhdHRyaWJ1dGUgJHtjb25maWcuQ1NTLkFUVFJJQlVURVMuZGF0YVNlbGVjdGlvbn0gZG9lcyBub3QgZXhpc3Qgb24gdGVybSBidXR0b25gKVxyXG4gICAgICB9XHJcbiAgICAgIGFydGlzdEFjdGlvbnMuc2VsZWN0aW9ucy50ZXJtID0gYXR0clxyXG4gICAgICBzZWxlY3Rpb25zLnRlcm1UYWJNYW5hZ2VyLnNlbGVjdE5ld1RhYihidG4sIGJvcmRlckNvdmVyKVxyXG5cclxuICAgICAgY29uc3QgY3VyckFydGlzdHMgPSBhcnRpc3RBY3Rpb25zLmdldEN1cnJTZWxUb3BBcnRpc3RzKClcclxuICAgICAgYXJ0aXN0Q2FyZHNIYW5kbGVyLmRpc3BsYXlBcnRpc3RDYXJkcyhjdXJyQXJ0aXN0cylcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhcnRpc3RUZXJtQnRucyA9IGFydGlzdFRlcm1TZWxlY3Rpb25zLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdidXR0b24nKVxyXG4gICAgY29uc3QgdHJhY2tUZXJtQm9yZGVyQ292ZXJzID0gYXJ0aXN0VGVybVNlbGVjdGlvbnMuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjb25maWcuQ1NTLkNMQVNTRVMuYm9yZGVyQ292ZXIpXHJcblxyXG4gICAgaWYgKHRyYWNrVGVybUJvcmRlckNvdmVycy5sZW5ndGggIT09IGFydGlzdFRlcm1CdG5zLmxlbmd0aCkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdOb3QgYWxsIHRyYWNrIHRlcm0gYnV0dG9ucyBjb250YWluIGEgYm9yZGVyIGNvdmVyJylcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFydGlzdFRlcm1CdG5zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGNvbnN0IGJ0biA9IGFydGlzdFRlcm1CdG5zW2ldXHJcbiAgICAgIGNvbnN0IGJvcmRlckNvdmVyID0gdHJhY2tUZXJtQm9yZGVyQ292ZXJzW2ldXHJcbiAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IG9uQ2xpY2soYnRuLCBib3JkZXJDb3ZlcikpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBmdW5jdGlvbiByZXNldFZpZXdhYmxlQ2FyZHMgKCkge1xyXG4gIC8vICAgY29uc3Qgdmlld0FsbEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLkNTUy5JRHMudmlld0FsbFRvcFRyYWNrcylcclxuICAvLyAgIHRyYWNrQWN0aW9ucy5zZWxlY3Rpb25zLm51bVZpZXdhYmxlQ2FyZHMgPSBERUZBVUxUX1ZJRVdBQkxFX0NBUkRTXHJcbiAgLy8gICB2aWV3QWxsRWwudGV4dENvbnRlbnQgPSAnU2VlIEFsbCA1MCdcclxuICAvLyB9XHJcblxyXG4gIC8vIGZ1bmN0aW9uIGFkZFZpZXdBbGxUcmFja3NFdmVudCAoKSB7XHJcbiAgLy8gICBjb25zdCB2aWV3QWxsRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuQ1NTLklEcy52aWV3QWxsVG9wVHJhY2tzKVxyXG4gIC8vICAgZnVuY3Rpb24gb25DbGljayAoKSB7XHJcbiAgLy8gICAgIGlmICh0cmFja0FjdGlvbnMuc2VsZWN0aW9ucy5udW1WaWV3YWJsZUNhcmRzID09IERFRkFVTFRfVklFV0FCTEVfQ0FSRFMpIHtcclxuICAvLyAgICAgICB0cmFja0FjdGlvbnMuc2VsZWN0aW9ucy5udW1WaWV3YWJsZUNhcmRzID0gTUFYX1ZJRVdBQkxFX0NBUkRTXHJcbiAgLy8gICAgICAgdmlld0FsbEVsLnRleHRDb250ZW50ID0gJ1NlZSBMZXNzJ1xyXG4gIC8vICAgICB9IGVsc2Uge1xyXG4gIC8vICAgICAgIHJlc2V0Vmlld2FibGVDYXJkcygpXHJcbiAgLy8gICAgIH1cclxuICAvLyAgICAgY29uc3QgY3VyclRyYWNrcyA9IHRyYWNrQWN0aW9ucy5nZXRDdXJyU2VsVG9wVHJhY2tzKClcclxuICAvLyAgICAgZGlzcGxheUNhcmRJbmZvLmRpc3BsYXlUcmFja0NhcmRzKGN1cnJUcmFja3MpXHJcbiAgLy8gICB9XHJcblxyXG4gIC8vICAgdmlld0FsbEVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gb25DbGljaygpKVxyXG4gIC8vIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGFkZEFydGlzdFRlcm1CdXR0b25FdmVudHNcclxuICAgIC8vIGFkZFZpZXdBbGxUcmFja3NFdmVudCxcclxuICB9XHJcbn0pKCk7XHJcblxyXG4oZnVuY3Rpb24gKCkge1xyXG4gIHByb21pc2VIYW5kbGVyKGNoZWNrSWZIYXNUb2tlbnMoKSwgKGhhc1Rva2VuKSA9PlxyXG4gICAgb25TdWNjZXNzZnVsVG9rZW5DYWxsKGhhc1Rva2VuLCAoKSA9PiB7XHJcbiAgICAgIC8vIHdoZW4gZW50ZXJpbmcgdGhlIHBhZ2UgYWx3YXlzIHNob3cgc2hvcnQgdGVybSB0cmFja3MgZmlyc3RcclxuICAgICAgYXJ0aXN0QWN0aW9ucy5zZWxlY3Rpb25zLnRlcm0gPSAnc2hvcnRfdGVybSdcclxuICAgICAgYXJ0aXN0Q2FyZHNIYW5kbGVyLmRpc3BsYXlBcnRpc3RDYXJkcyhhcnRpc3RBcnJzLnRvcEFydGlzdE9ianNTaG9ydFRlcm0pXHJcbiAgICB9KVxyXG4gIClcclxuICBPYmplY3QuZW50cmllcyhhZGRFdmVudExpc3RlbmVycykuZm9yRWFjaCgoWywgYWRkRXZlbnRMaXN0ZW5lcl0pID0+IHtcclxuICAgIGFkZEV2ZW50TGlzdGVuZXIoKVxyXG4gIH0pXHJcbn0pKClcclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL3B1YmxpYy9wYWdlcy90b3AtYXJ0aXN0cy1wYWdlL3RvcC1hcnRpc3RzLnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9