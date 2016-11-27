goog.provide('mm.modules.slideshow');

goog.require('mm.module');

/**
 * Everything Slideshow
 *
 * @constructor
 * @extends {mm.module}
 * @param {Object} ctx root element of the module, wrapped by G
 * @param {Number} id internal id, doesn't really mean anything
 * @param {Object} pubsub PubSub
 * @param {Object=} params optional additional parameters
 */
mm.modules.slideshow = function(ctx, id, pubsub, params) {
  goog.base(this, ctx, id, pubsub, params);
  this.name = 'slideshow';
};
goog.inherits(mm.modules.slideshow, mm.module);
goog.exportSymbol('mm.modules.slideshow', mm.modules.slideshow);

mm.modules.slideshow.prototype.run = function() {
  this.log('Module "slideshow" runs!');
};

// External module finished loading
goog.module.ModuleManager.getInstance().setLoaded('slideshow');
