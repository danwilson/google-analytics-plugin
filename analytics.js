function UniversalAnalyticsPlugin() {};

UniversalAnalyticsPlugin.prototype.startTrackerWithId = function(id) {
	cordova.exec(function() {}, function() {}, 'UniversalAnalytics', 'startTrackerWithId', [id]);
};

UniversalAnalyticsPlugin.prototype.trackView = function(screen) {
	cordova.exec(function() {}, function() {}, 'UniversalAnalytics', 'trackView', [screen]);
};

UniversalAnalyticsPlugin.prototype.trackEvent = function(category,action,label) {
	var options = {category:category,
		action:action,
		label:label,
		value:isNaN(parseInt(value)) ? -1 : value};
	cordova.exec(function() {}, function() {}, 'UniversalAnalytics', 'trackEvent',[category, action, label]);
};

cordova.addConstructor(function() {
  if(!window.plugins) window.plugins = {};
  window.plugins.universalAnalyticsPlugin = new UniversalAnalyticsPlugin();
});