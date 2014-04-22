function UniversalAnalyticsPlugin() {}

UniversalAnalyticsPlugin.prototype.startTrackerWithId = function(id, success, error) {
  cordova.exec(success, error, 'UniversalAnalytics', 'startTrackerWithId', [id]);
};

UniversalAnalyticsPlugin.prototype.trackView = function(screen, success, error) {
  cordova.exec(success, error, 'UniversalAnalytics', 'trackView', [screen]);
};

UniversalAnalyticsPlugin.prototype.addCustomDimension = function(key, value, success, error) {
  cordova.exec(success, error, 'UniversalAnalytics', 'addCustomDimension', [key, value]);
};

UniversalAnalyticsPlugin.prototype.trackEvent = function(category, action, label, value, success, error) {
  if (typeof label === 'undefined' || label === null) {
    label = '';
  }
	if (typeof value === 'undefined' || value === null) {
		value = 0;
  }

	cordova.exec(success, error, 'UniversalAnalytics', 'trackEvent', [category, action, label, value]);
};

module.exports = new UniversalAnalyticsPlugin();
