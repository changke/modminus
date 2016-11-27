goog.provide('mm.modules.navigation');

goog.require('mm.module');

/**
 * navigation for creating new modules, copy, paste, search & replace baby!
 *
 * @constructor
 * @extends {mm.module}
 * @param {Object} ctx Root element of the module, wrapped as a G object
 * @param {Number} id Internal id, doesn't really mean anything
 * @param {Object} pubsub PubSub object
 * @param {Object=} params Optional additional parameters
 */
mm.modules.navigation = function(ctx, id, pubsub, params) {
  goog.base(this, ctx, id, pubsub, params);
  this.name = 'navigation';
};
goog.inherits(mm.modules.navigation, mm.module);
goog.exportSymbol('mm.modules.navigation', mm.modules.navigation);

mm.modules.navigation.prototype.run = function() {
  var self = this;

  this.getJSON('/assets/navigation/nav.json', {}, function(res) {
    self.renderNav(res.data);
  });
};

mm.modules.navigation.prototype.renderNav = function(navData) {
  try {
    this.ctx.find('#nested').append(G(mm.templates.navigation.renderNavList({
      navList: navData['navList']
    }).content));
  } catch (e) {
    this.log(e, 'error');
  }
};
