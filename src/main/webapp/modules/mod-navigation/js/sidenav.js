goog.provide('mm.modules.sidenav');

goog.require('mm.module');

/**
 * sidenav open/closed toggling
 *
 * @constructor
 * @extends {mm.module}
 * @param {Object} ctx Root element of the module, wrapped as a G object
 * @param {Number} id Internal id, doesn't really mean anything
 * @param {Object} pubsub PubSub object
 * @param {Object=} params Optional additional parameters
 */
mm.modules.sidenav = function(ctx, id, pubsub, params) {
  goog.base(this, ctx, id, pubsub, params);
  this.name = 'sidenav';
};
goog.inherits(mm.modules.sidenav, mm.module);
goog.exportSymbol('mm.modules.sidenav', mm.modules.sidenav);

mm.modules.sidenav.prototype.run = function() {
};
