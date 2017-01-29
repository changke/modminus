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

  this.itemSelector = '[data-item]';
  this.editButtonSelector = '[data-action="edit"]';
  this.doneButtonSelector = '[data-action="done"]';
  this.cancelButtonSelector = '[data-action="cancel"]';
  this.deleteButtonSelector = '[data-action="delete"]';
};
goog.inherits(mm.modules.ipe, mm.module);
goog.exportSymbol('mm.modules.ipe', mm.modules.ipe);

mm.modules.ipe.prototype.run = function() {
  var self = this;

  this.getJSON('/assets/inplaceedit/example.json', {}, function(res) {
    self.listItems(res.items);
  });
};

mm.modules.ipe.prototype.listItems = function(itemsData) {
  // show items
  var itemsHtml = mm.templates.inplaceedit.list({items: itemsData}).content;
  this.ctx.empty().append(G(itemsHtml));

  // set edit/delete button events
  var items = this.ctx.find(this.itemSelector);
  if (items.length > 0 && items.length === itemsData.length) {
    for (var i = 0; i < items.length; i++) {}
  }
};
