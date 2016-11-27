goog.provide('mm.module');

goog.require('goog.events');
goog.require('goog.log.Logger');
goog.require('goog.net.Cookies');
goog.require('goog.net.EventType');
goog.require('goog.net.XhrIo');
goog.require('goog.structs.Map');
goog.require('goog.Uri');
goog.require('goog.Uri.QueryData');
goog.require('goog.uri.utils');
goog.require('G');

/**
 * Parent module & collection of common methods
 *
 * @constructor
 * @param {Object} ctx Root element of the module, wrapped by G
 * @param {Number} id Internal id, doesn't really mean anything
 * @param {Object} pubsub PubSub
 * @param {Object=} params Optional additional parameters
 */
mm.module = function(ctx, id, pubsub, params) {
  this.ctx = ctx;
  this.ctxElement = (ctx !== null) ? ctx[0] : ctx;
  this.id = id;
  this.pubsub = pubsub;
  this.params = params;
  this.name = 'module';
  this.logger = null;
};

mm.module.prototype.start = function() {
  if (typeof this.run === 'function') {
    this.logger = goog.log.Logger.getLogger(this.name);
    this.run();
  }
};

/**
 * Get name
 *
 * @returns {String} The name of this module
 */
mm.module.prototype.getName = function() {
  return this.name;
};

/**
 * Get ID
 *
 * @returns {Number} Module ID
 */
mm.module.prototype.getId = function() {
  return this.id;
};

/**
 * Log things (our main debugging method...)
 *
 * @param {String} message What to log
 * @param {String=} type Optional
 */
mm.module.prototype.log = function(message, type) {
  if (goog.DEBUG) {
    if (type) {
      switch (type) {
        case 'error':
          this.logger.severe(message);
          break;
        case 'raw':
          if (window['console'] && window['console']['log']) {
            window['console']['log'](message);
          }
          break;
        default:
          this.logger.info(message);
      }
    } else {
      this.logger.info(message);
    }
  }
};

/**
 * PubSub: pub
 *
 * @param {String} topic What to broadcast
 * @param {Object=} args Optional additional parameter(s)
 */
mm.module.prototype.publish = function(topic, args) {
  this.pubsub.publish(topic, args);
};

/**
 * PubSub: sub
 *
 * @param {String} topic What to listen to
 * @param {Function} callback Event-Handler
 */
mm.module.prototype.subscribe = function(topic, callback) {
  this.pubsub.subscribe(topic, callback);
};

/**
 * PubSub: sub once
 *
 * @param {String} topic What to listen to
 * @param {Function} callback Event-Handler
 */
mm.module.prototype.subscribeOnce = function(topic, callback) {
  this.pubsub.subscribeOnce(topic, callback);
};

/**
 * PubSub: unsub
 *
 * @param {String} topic What to listen to
 * @param {Function} callback Event-Handler
 */
mm.module.prototype.unsubscribe = function(topic, callback) {
  this.pubsub.unsubscribe(topic, callback);
};

/**
 * General method for Ajax request
 *
 * @param {String} url Target URL
 * @param {String} method Request method: 'GET'|'POST'
 * @param {Object} data Data/content to be sent to server, should be in JSON format
 * @param {Function=} callback Function to be called when Ajax request is complete
 * @param {String=} dataType Response data type: 'JSON'|'XML'|'TEXT'
 */
mm.module.prototype.ajax = function(url, method, data, callback, dataType) {
  var self = this;

  var xhr = new goog.net.XhrIo();
  var reqData = goog.Uri.QueryData.createFromMap(new goog.structs.Map(data));

  goog.events.listen(xhr, goog.net.EventType.COMPLETE, function() {
    if (xhr.isSuccess()) {
      self.log('Ajax request successfully completed.');
      if (callback && typeof callback === 'function') {
        var response = null;
        switch (dataType.toUpperCase()) {
          case 'JSON':
            response = xhr.getResponseJson();
            break;
          case 'XML':
            response = xhr.getResponseXml();
            break;
          default:
            response = xhr.getResponseText();
            break;
        }
        callback(response, true); // callback: function(response, success)
      }
    } else {
      self.log('Ajax request error: ' + xhr.getLastError());
      if (callback && typeof callback === 'function') {
        callback(null, false);
      }
    }
  });

  if (method.toUpperCase() === 'GET') {
    url = url + '?' + goog.uri.utils.buildQueryDataFromMap(data).replace('%20', '+');
  }

  xhr.send(encodeURI(url), method, reqData.toString());
};

/**
 * Shorthand method for a most common operation
 *
 * @param {String} url Target URL
 * @param {Object} data Data/content to be sent to server, should be in JSON format
 * @param {Function=} callback Function to be called when Ajax request is complete
 */
mm.module.prototype.get = function(url, data, callback) {
  this.ajax(url, 'GET', data, callback);
};

/**
 * Shorthand method for a most common operation
 *
 * @param {String} url Target URL
 * @param {Object} data Data/content to be sent to server, should be in JSON format
 * @param {Function=} callback Function to be called when Ajax request is complete
 */
mm.module.prototype.getJSON = function(url, data, callback) {
  this.ajax(url, 'GET', data, callback, 'JSON');
};

/**
 * Shorthand method for a most common operation
 *
 * @param {String} url Target URL
 * @param {Object} data Data/content to be sent to server, should be in JSON format
 * @param {Function=} callback Function to be called when Ajax request is complete
 * @param {String=} dataType Response data type: 'JSON'|'XML'|'TEXT'
 */
mm.module.prototype.post = function(url, data, callback, dataType) {
  this.ajax(url, 'POST', data, callback, dataType);
};

/**
 * Check current viewport size against media queries
 *
 * @param {String} viewportAlias Name of the viewport: tablet|desktop|large
 * @returns {Boolean} If current viewport fulfills the condition
 */
mm.module.prototype.matchViewport = function(viewportAlias) {
  var ret = true;
  if (typeof window['matchMedia'] !== 'function') { // fallback
    ret = (viewportAlias === 'desktop') || (viewportAlias === 'large');
  } else {
    switch (viewportAlias) {
      case 'tablet':
        ret = window.matchMedia('(min-width:48em)').matches;
        break;
      case 'desktop':
        ret = window.matchMedia('(min-width:64em)').matches;
        break;
      case 'large':
        ret = window.matchMedia('(min-width:80em)').matches;
        break;
    }
  }
  return ret;
};

mm.module.prototype.hasRetina = function() {
  var ret = false;
  if (typeof window['matchMedia'] === 'function') {
    ret = window.matchMedia('(-webkit-min-device-pixel-ratio:2),(min-resolution:192dpi),(min-resolution:2dppx)').matches;
  }
  return ret;
};

mm.module.prototype.loadScripts = function(url, callback) {
  if (typeof callback === 'function') {
    window['loadJS'](url, callback);
  } else {
    window['loadJS'](url);
  }
};

mm.module.prototype.loadStylesheets = function(url, callback) {
  if (typeof callback === 'function') {
    window['loadJS'](url, callback, true);
  } else {
    window['loadJS'](url, function() {}, true);
  }
};

mm.module.prototype.checkRequiredDOMElements = function(selectors) {
  // wrap involved DOM elements with G
  for (var sel in selectors) {
    if (selectors.hasOwnProperty(sel)) {
      this[sel] = this.ctx.find(selectors[sel]);
      if (this[sel].length < 1) {
        this.log('Required DOM element "' + selectors[sel] + '" was not found!');
        return false;
      }
    }
  }

  return true;
};

mm.module.prototype.getCookie = function(cookieName) {
  return goog.net.cookies.get(cookieName);
};

mm.module.prototype.setCookie = function(cookieName, cookieValue, days, path, domain) {
  var p = path || '/';
  var d = domain;
  goog.net.cookies.set(cookieName, cookieValue, days * 24 * 60 * 60, p, d);
};

mm.module.prototype.removeCookie = function(cookieName, path, domain) {
  var p = path || '/';
  var d = domain;
  goog.net.cookies.remove(cookieName, p, d);
};
