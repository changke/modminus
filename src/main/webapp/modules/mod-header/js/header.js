goog.provide('mm.modules.header');

goog.require('mm.module');

/**
 * Header functions
 *
 * @constructor
 * @extends {mm.module}
 * @param {Object} ctx Root element of the module, wrapped as a G object
 * @param {Number} id Internal id, doesn't really mean anything
 * @param {Object} pubsub PubSub object
 * @param {Object=} params Optional additional parameters
 */
mm.modules.header = function(ctx, id, pubsub, params) {
  goog.base(this, ctx, id, pubsub, params);
  this.name = 'header';
};
goog.inherits(mm.modules.header, mm.module);
goog.exportSymbol('mm.modules.header', mm.modules.header);

mm.modules.header.prototype.run = function() {};
