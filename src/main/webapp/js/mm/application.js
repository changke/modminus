goog.provide('mm.application');

goog.require('G');
goog.require('GG');
goog.require('goog.dom.BufferedViewportSizeMonitor');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.log.Logger');
goog.require('goog.pubsub.PubSub');
goog.require('goog.module.ModuleLoader');
goog.require('goog.module.ModuleManager');

/**
 * Initializes PubSub, ModuleManager for external modules
 *
 * @constructor
 */
mm.application = function() {
  var self = this;

  this.id = 0;
  this.moduleInstances = [];
  this.nextId = function() {
    return ++self.id;
  };

  this.pubsub = new goog.pubsub.PubSub();

  this.logger = goog.log.Logger.getLogger('application');

  // external module loader
  this.moduleManager = goog.module.ModuleManager.getInstance();
  this.moduleLoader = new goog.module.ModuleLoader();

  this.moduleManager.setLoader(this.moduleLoader);
  this.moduleManager.setAllModuleInfo(goog.global['PLOVR_MODULE_INFO']);
  this.moduleManager.setModuleUris(goog.global['PLOVR_MODULE_URIS']);

  this.moduleManager.setLoaded('core');
};
goog.addSingletonGetter(mm.application); // singleton!
goog.exportSymbol('mm.application', mm.application);

/**
 * Finds and initializes all visual modules on the page (module name grouped)
 */
mm.application.prototype.registerModules = function() {
  var distinctModuleNames = [];

  G('.mod:not([data-ignore])').each(function(el) {
    var classes = el.className.split(' ');
    for (var i = 0, len = classes.length; i < len; i++) {
      var cls = classes[i].toLowerCase();
      // if it is a module marker and that module name has not yet been identified
      if (cls.substr(0, 4) === 'mod-') {
        var moduleName = cls.substring(4);
        if (GG.inArray(distinctModuleNames, moduleName) === -1) {
          distinctModuleNames.push(moduleName);
        }
      }
    }
  });

  for (var j = 0, dmn = distinctModuleNames.length; j < dmn; j++) {
    this.registerSingleModule(distinctModuleNames[j], null);
  }

  return this;
};

/**
 * Find and initialize (all) modules of a type
 *
 * @param {String} moduleName The name of the module
 * @param {Object=} params Optional additional parameters
 */
mm.application.prototype.registerSingleModule = function(moduleName, params) {
  var moduleClass = goog.getObjectByName('mm.modules.' + moduleName); // so every module must export itself!
  var self = this;

  if (moduleClass) {
    var visual = false;
    var ctxSel = '';
    if (params && params['contextSelector']) {
      ctxSel = params['contextSelector'] + ' ';
    }

    G(ctxSel + '.mod.mod-' + moduleName + ':not([data-ignore])').each(function(el) {
      if (!el.hasAttribute('data-init')) {
        var m = new moduleClass(G(el), self.nextId(), self.pubsub, params); // creates module instance
        el.setAttribute('data-init', 'true'); // to prevent re-initializing
        if (goog.DEBUG) {
          self.logger.info('Visual module ' + m.getId() + ': "' + m.getName() + '" initialized.');
        }
        self.moduleInstances.push(m);
      }
      if (!visual) {
        visual = true;
      }
    });

    // register a non-visual module (module without markups)
    if (!visual) {
      var nvm = new moduleClass(null, self.nextId(), self.pubsub, params);
      if (goog.DEBUG) {
        self.logger.info('Non-visual module ' + nvm.getId() + ': "' + nvm.getName() + '" initialized.');
      }
      self.moduleInstances.push(nvm);
    }
  } else { // can be an external module or simply typo...
    switch (moduleName) {
      case 'slideshow':
      case 'video':
        if (goog.DEBUG) {
          self.logger.info('External module "' + moduleName + '" needed...');
        }
        self.moduleManager.execOnLoad(moduleName, function() {
          // start the external module
          self.registerSingleModule(moduleName, null).startModule(moduleName);
        });
        break;
      default:
        if (goog.DEBUG) {
          self.logger.info('Class not found for module "' + moduleName + '".');
        }
        break;
    }
  }

  return this;
};

/**
 * Application entry, also contains some common event broadcasting like resize and scroll
 */
mm.application.prototype.start = function() {
  var self = this;

  // listen to some common events and publish messages centrally instead of doing so in every module
  var vsm = new goog.dom.ViewportSizeMonitor();
  var bufferedVsm = new goog.dom.BufferedViewportSizeMonitor(vsm);

  // viewport resize event
  goog.events.listen(bufferedVsm, goog.events.EventType.RESIZE, function() {
    self.sendMessage('viewportChanged', vsm.getSize());
    if (goog.DEBUG) {
      self.logger.info('Viewport changed to: ' + vsm.getSize().toString() + '.');
    }
  });

  // window load event
  goog.events.listen(window, goog.events.EventType.LOAD, function() {
    self.sendMessage('windowLoaded', null);
  });

  // window scroll event (reduced firing interval for performance)
  var scrollTimer;
  var getScrollY = function() {
    // compatible code from MDN: http://goo.gl/DeovBp
    var supportPageOffset = window.pageXOffset !== undefined;
    var isCSS1Compat = ((document.compatMode || '') === 'CSS1Compat');

    //var x = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
    var y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

    return y;
  };
  var oldScrollY = getScrollY();
  var newScrollY;
  goog.events.listen(window, goog.events.EventType.SCROLL, function() {
    if (scrollTimer) {
      window.clearTimeout(scrollTimer);
    }
    scrollTimer = setTimeout(function() {
      self.sendMessage('windowScrolling', null);
      newScrollY = getScrollY();
      if (newScrollY > oldScrollY) {
        self.sendMessage('windowScrollingDown', newScrollY);
      } else if (newScrollY < oldScrollY) {
        self.sendMessage('windowScrollingUp', newScrollY);
      }
      oldScrollY = newScrollY;
    }, 100);
  });

  // call the start methods of all initialized modules
  for (var i = 0, len = this.moduleInstances.length; i < len; i++) {
    this.moduleInstances[i].start();
  }
};

/**
 * broadcast messages through PubSub (the same one throughout the whole app)
 *
 * @param {String} topic What to send
 * @param {Object=} args Optional additional parameters
 */
mm.application.prototype.sendMessage = function(topic, args) {
  this.pubsub.publish(topic, args);
};

/**
 * Start a module manually
 *
 * @param {String} moduleName
 */
mm.application.prototype.startModule = function(moduleName) {
  for (var i = 0, len = this.moduleInstances.length; i < len; i++) {
    var mi = this.moduleInstances[i];
    if (mi.getName() === moduleName) {
      mi.start();
    }
  }
};
