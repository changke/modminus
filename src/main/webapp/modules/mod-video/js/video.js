goog.provide('mm.modules.video');

goog.require('mm.module');

/**
 * Everything Video
 *
 * @constructor
 * @extends {mm.module}
 * @param {Object} ctx root element of the module, wrapped by G
 * @param {Number} id internal id, doesn't really mean anything
 * @param {Object} pubsub PubSub
 * @param {Object=} params optional additional parameters
 */
mm.modules.video = function(ctx, id, pubsub, params) {
  goog.base(this, ctx, id, pubsub, params);
  this.name = 'video';

  this.key = '$698830113013194'; // mail.com commercial license
  this.playerContainer = null;
  this.videoUrl = '';
  this.videoType = 'video/mp4';
  this.trackingUrl = '';
};
goog.inherits(mm.modules.video, mm.module);
goog.exportSymbol('mm.modules.video', mm.modules.video);

mm.modules.video.prototype.run = function() {
  var self = this;

  this.playerContainer = this.ctx.find('.js-video-player');
  if (this.playerContainer.length > 0) {
    this.playerContainer = this.playerContainer[0];
  }

  this.videoUrl = this.playerContainer.getAttribute('data-src');

  if (this.videoUrl.indexOf('.flv') > 0) {
    this.videoType = 'video/flash';
  }

  // load flowplayer assets
  this.loadStylesheets(window['ASSETS_HOST'] + '/assets/video/skin/functional.css', function() {
    self.loadScripts(window['ASSETS_HOST'] + '/assets/video/flowplayer.min.js', function() {
      self.initPlayer();
    });
  });
};

mm.modules.video.prototype.initPlayer = function() {
  var self = this;

  var conf = {
    'autoplay': true,
    'clip': {
      'sources': [
        {
          'type': self.videoType,
          'src': self.videoUrl
        }
      ]
    },
    'embed': false,
    'key': self.key,
    'swf': window['ASSETS_HOST'] + '/assets/video/flowplayer.swf'
  };

  window['flowplayer'](this.playerContainer, conf);
};

// External module finished loading
goog.module.ModuleManager.getInstance().setLoaded('video');
