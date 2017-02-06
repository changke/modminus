goog.provide('mm.modules.messagebar');

goog.require('mm.module');

/**
 * message bar can be clicked away
 *
 * @constructor
 * @extends {mm.module}
 * @param {Object} ctx Root element of the module, wrapped as a G object
 * @param {Number} id Internal id, doesn't really mean anything
 * @param {Object} pubsub PubSub object
 * @param {Object=} params Optional additional parameters
 */
mm.modules.messagebar = function(ctx, id, pubsub, params) {
  goog.base(this, ctx, id, pubsub, params);
  this.name = 'messagebar';

  this.closeBtnSelector = '.' + this.name + '__close';
};
goog.inherits(mm.modules.messagebar, mm.module);
goog.exportSymbol('mm.modules.messagebar', mm.modules.messagebar);

mm.modules.messagebar.prototype.run = function() {
  var self = this;

  var closeBtn = this.ctx.find(this.closeBtnSelector);
  if (closeBtn.length > 0) {
    closeBtn.on('click', function(e) {
      e.preventDefault();
      self.ctx.removeNode();
    });
  }
};
