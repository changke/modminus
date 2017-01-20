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

  this.topNavLinkClass = this.name + '__link';
  this.subWrapperClass = this.name + '__subwrapper';
  this.openClass = 'sidenav__subwrapper_open';
};
goog.inherits(mm.modules.sidenav, mm.module);
goog.exportSymbol('mm.modules.sidenav', mm.modules.sidenav);

mm.modules.sidenav.prototype.run = function() {
  var self = this;

  var topNavLinks = this.ctx.find('.' + this.topNavLinkClass);
  topNavLinks.on('click', function(e) {
    e.preventDefault();

    self.hideAllSubNavs();

    var sectionId = this.getAttribute('data-section');
    if (sectionId && sectionId.length > 0) {
      var subNav = self.ctx.find('.' + self.subWrapperClass + '[data-section="' + sectionId + '"]');
      if (subNav.length > 0) {
        subNav.addClass(self.openClass);
      }
    }
    return false;
  });
};

mm.modules.sidenav.prototype.hideAllSubNavs = function() {
  var subNavs = this.ctx.find('.' + this.subWrapperClass);
  subNavs.removeClass(this.openClass);
};
