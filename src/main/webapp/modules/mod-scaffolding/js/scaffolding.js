goog.provide('mm.modules.scaffolding');

goog.require('mm.module');

/**
 * Scaffolding for creating new modules, copy, paste, search & replace baby!
 *
 * @constructor
 * @extends {mm.module}
 * @param {Object} ctx Root element of the module, wrapped as a G object
 * @param {Number} id Internal id, doesn't really mean anything
 * @param {Object} pubsub PubSub object
 * @param {Object=} params Optional additional parameters
 */
mm.modules.scaffolding = function(ctx, id, pubsub, params) {
  goog.base(this, ctx, id, pubsub, params);
  this.name = 'scaffolding';
};
goog.inherits(mm.modules.scaffolding, mm.module);
goog.exportSymbol('mm.modules.scaffolding', mm.modules.scaffolding);

mm.modules.scaffolding.prototype.run = function() {
  var self = this;

  this.log('Module "scaffolding" runs!');

  this.subscribe('windowScrolling', function() {
    self.log('Window scrolling.');
  });

  this.ctx.append(G(mm.templates.scaffolding.hello({'name': 'world'}).content));
};
