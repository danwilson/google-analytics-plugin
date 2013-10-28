define(function(require) {

  var Disposable = require('lavaca/util/Disposable');
  var Config = require('lavaca/util/Config');
  var Promise = require('lavaca/util/Promise');
  var Device = require('lavaca/env/Device');
  var $ = require('$');

  var AnalyticsService = Disposable.extend(function AnalyticsService() {
    Disposable.call(this);
    this.appId = Config.get('google_analytics_id');
    document.addEventListener('deviceready', this.init.bind(this), false);
  }, {
    ready: false,
    queue: [],
    init: function() {
      this.ready = true;

      if (Device.isCordova()) {
        analytics.startTrackerWithId(this.appId);
        this.processQueue();
      }
    },
    trackView: function(screen) {
      if (Device.isCordova()) {
        if (this.ready) {
          analytics.trackView(screen);
        } else {
          this.queue.push({
            action: 'trackView',
            params: [screen]
          });
        }
      }
    },
    trackEvent: function(category, action, label) {
      if (Device.isCordova()) {
        if (this.ready) {
          analytics.trackEvent(category, action || '', label || '');
        } else {
          this.queue.push({
            action: 'trackEvent',
            params: [category, action || '', label || '']
          });
        }
      }
    },
    processQueue: function() {
      if (this.queue) {
        for (var i = 0; i < this.queue.length; ++i) {
          cordova.exec(function() {}, function() {}, 
            'UniversalAnalytics', this.queue[i].action, this.queue[i].params);
        }
      }
    }
  });

  return new AnalyticsService();

});