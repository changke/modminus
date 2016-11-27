goog.provide('mm.modules.inviewcheck');

goog.require('mm.module');

/**
 * Check if this element is in current viewport (y-axis)
 *
 * @constructor
 * @extends {mm.module}
 * @param {Object} ctx Root element of the module, wrapped as a G object
 * @param {Number} id Internal id, doesn't really mean anything
 * @param {Object} pubsub PubSub object
 * @param {Object=} params Optional additional parameters
 */
mm.modules.inviewcheck = function(ctx, id, pubsub, params) {
  goog.base(this, ctx, id, pubsub, params);
  this.name = 'inviewcheck';
  this.el = ctx[0];
  this.lastInView = false;
};
goog.inherits(mm.modules.inviewcheck, mm.module);
goog.exportSymbol('mm.modules.inviewcheck', mm.modules.inviewcheck);

mm.modules.inviewcheck.prototype.run = function() {
  var self = this;

  var inViewCheck = function() {
    var newInView = self.isInView(self.ctxElement);
    if (newInView !== self.lastInView) {
      self.lastInView = newInView;
      self.log('Element ' + self.el.id + ' viewStateChanged: ' + newInView);
      self.publish('viewStateChanged', {
        element: self.ctxElement,
        inView: newInView
      });
    }
  };

  this.subscribe('viewportChanged', inViewCheck);
  this.subscribe('windowScrolling', inViewCheck);

  // initial check
  inViewCheck();
};

mm.modules.inviewcheck.prototype.isInView = function(el) {
  var rect = el.getBoundingClientRect();
  var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  return (rect.top < viewportHeight && rect.bottom > 0);
};
