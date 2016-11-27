goog.provide('mm.start');

goog.require('G');
goog.require('GG');
goog.require('mm.application');
goog.require('goog.debug.Console');
goog.require('goog.log.Logger');

/**
 * Entry method. To be called by page
 *
 * @param {String} jsHost The URL of JavaScript (Could be of another domain -> CDN)
 */
mm.init = function(jsHost) {
  // overwrite G's selector engine
  var engine = function(selector, el) {
    if (el) {
      return el.querySelectorAll(selector);
    } else {
      return document.querySelectorAll(selector);
    }
  };
  GG.setSelectorEngine(engine);

  mm.start(jsHost);
};
goog.exportSymbol('mm.init', mm.init);

mm.start = function(jsHost) {
  var console = new goog.debug.Console();
  console.setCapturing(true);

  var logger = goog.log.Logger.getLogger('start');
  if (goog.DEBUG) {
    logger.info('mod- starting...');
  }

  window['ASSETS_HOST'] = '';

  // replace external module urls
  if (jsHost && jsHost.length > 0) {
    window['ASSETS_HOST'] = jsHost;
    var moduleUrls = window['PLOVR_MODULE_URIS'];
    if (moduleUrls) {
      for (var k in moduleUrls) {
        if (moduleUrls.hasOwnProperty(k)) {
          moduleUrls[k] = jsHost + moduleUrls[k];
        }
      }
    }
  }

  try {
    // get application instance
    var app = mm.application.getInstance();

    // register some modules individually: app.registerSingleModule('trackingpixel');

    app.registerModules(); // visual modules on current page

    app.start();
  } catch (e) {
    logger.severe('>_< Oops, something went wrong: ' + e);
  }

  if (goog.DEBUG) {
    logger.info('mod- started.');
  }
};

/**
 * Start an individual module (for unit-testing)
 *
 * @param {String} moduleName Name of module
 * @param {Boolean} external For external module do not start it (it must be registered and then loaded)
 */
mm.startModule = function(moduleName, external) {
  // overwrite G's selector engine
  var engine = function(selector, el) {
    if (el) {
      return el.querySelectorAll(selector);
    } else {
      return document.querySelectorAll(selector);
    }
  };
  GG.setSelectorEngine(engine);

  var app = mm.application.getInstance();
  app.registerSingleModule(moduleName, null); // load and initialize the module
  if (!external) {
    app.startModule(moduleName); // for internal module, start it immediately
  }
};
goog.exportSymbol('mm.startModule', mm.startModule);

/**
 * Message broadcasting using the PubSub of application, exported as helper function
 *
 * @param {String} topic The message to be sent
 * @param {Object=} params optional Additional parameters
 */
mm.sendMessage = function(topic, params) {
  var app = mm.application.getInstance();
  app.sendMessage(topic, params);
};
goog.exportSymbol('mm.sendMessage', mm.sendMessage);
