goog.provide('mm.modules.ipe');

goog.require('mm.module');

/**
 * In-Place Editing
 *
 * @constructor
 * @extends {mm.module}
 * @param {Object} ctx Root element of the module, wrapped as a G object
 * @param {Number} id Internal id, doesn't really mean anything
 * @param {Object} pubsub PubSub object
 * @param {Object=} params Optional additional parameters
 */
mm.modules.ipe = function(ctx, id, pubsub, params) {
  goog.base(this, ctx, id, pubsub, params);
  this.name = 'ipe';
};
goog.inherits(mm.modules.ipe, mm.module);
goog.exportSymbol('mm.modules.ipe', mm.modules.ipe);

mm.modules.ipe.prototype.run = function() {
  var self = this;

  this.getJSON('/assets/inplaceedit/example.json', {}, function(res) {
    self.listItems(res.items);
  });
};

mm.modules.ipe.prototype.listItems = function(items) {
  var itemsHtml = mm.templates.inplaceedit.list({items: items}).content;
  this.ctx.empty().append(G(itemsHtml));
};
