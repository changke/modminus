goog.provide('mm.modules.teaser');

goog.require('mm.module');

/**
 * Teaser/media block
 *
 * @constructor
 * @extends {mm.module}
 * @param {Object} ctx root element of the module, wrapped by G
 * @param {Number} id internal id, doesn't really mean anything
 * @param {Object} pubsub PubSub
 * @param {Object=} params optional additional parameters
 */
mm.modules.teaser = function(ctx, id, pubsub, params) {
  goog.base(this, ctx, id, pubsub, params);
  this.name = 'teaser';
};
goog.inherits(mm.modules.teaser, mm.module);
goog.exportSymbol('mm.modules.teaser', mm.modules.teaser);

mm.modules.teaser.prototype.run = function() {
  // More to come...
};
