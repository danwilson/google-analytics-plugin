function UniversalAnalyticsPlugin() {}

UniversalAnalyticsPlugin.prototype.startTrackerWithId = function(id, dispatchPeriod, success, error) {
  if (typeof dispatchPeriod === 'undefined' || dispatchPeriod === null) {
    dispatchPeriod = 30;
  }  
  cordova.exec(success, error, 'UniversalAnalytics', 'startTrackerWithId', [id, dispatchPeriod]);
};

UniversalAnalyticsPlugin.prototype.setAllowIDFACollection = function(enable, success, error) {
  cordova.exec(success, error, 'UniversalAnalytics', 'setAllowIDFACollection', [enable]);
};

UniversalAnalyticsPlugin.prototype.setUserId = function(id, success, error) {
  cordova.exec(success, error, 'UniversalAnalytics', 'setUserId', [id]);
};

UniversalAnalyticsPlugin.prototype.setAnonymizeIp = function(anonymize, success, error) {
  cordova.exec(success, error, 'UniversalAnalytics', 'setAnonymizeIp', [anonymize]);
};

UniversalAnalyticsPlugin.prototype.setOptOut = function(optout, success, error) {
  cordova.exec(success, error, 'UniversalAnalytics', 'setOptOut', [optout]);
};

UniversalAnalyticsPlugin.prototype.setAppVersion = function(version, success, error) {
  cordova.exec(success, error, 'UniversalAnalytics', 'setAppVersion', [version]);
};

/* enables verbose logging */
UniversalAnalyticsPlugin.prototype.debugMode = function(success, error) {
  cordova.exec(success, error, 'UniversalAnalytics', 'debugMode', []);
};

UniversalAnalyticsPlugin.prototype.trackMetric = function(key, value, success, error) {
  cordova.exec(success, error, 'UniversalAnalytics', 'trackMetric', [key, value]);
};

UniversalAnalyticsPlugin.prototype.trackView = function(screen, campaingUrl, newSession, success, error) {
  if (typeof campaingUrl === 'undefined' || campaingUrl === null) {
    campaingUrl = '';
  }

  if (typeof newSession === 'undefined' || newSession === null) {
    newSession = false;
  }  

  cordova.exec(success, error, 'UniversalAnalytics', 'trackView', [screen, campaingUrl, newSession]);
};

UniversalAnalyticsPlugin.prototype.addCustomDimension = function(key, value, success, error) {
  if (typeof key !== "number") {
    throw Error("key must be a valid integer not '" + typeof key + "'");
  }
  cordova.exec(success, error, 'UniversalAnalytics', 'addCustomDimension', [key, value]);
};

UniversalAnalyticsPlugin.prototype.trackEvent = function(category, action, label, value, newSession, success, error) {
  if (typeof label === 'undefined' || label === null) {
    label = '';
  }
  if (typeof value === 'undefined' || value === null) {
    value = 0;
  }

  if (typeof newSession === 'undefined' || newSession === null) {
    newSession = false;
  }    

  cordova.exec(success, error, 'UniversalAnalytics', 'trackEvent', [category, action, label, value, newSession]);
};

/**
 * https://developers.google.com/analytics/devguides/collection/android/v3/exceptions
 */
UniversalAnalyticsPlugin.prototype.trackException = function(description, fatal, success, error) {
  cordova.exec(success, error, 'UniversalAnalytics', 'trackException', [description, fatal]);
};

UniversalAnalyticsPlugin.prototype.trackTiming = function(category, intervalInMilliseconds, name, label, success, error) {
  if (typeof intervalInMilliseconds === 'undefined' || intervalInMilliseconds === null) {
    intervalInMilliseconds = 0;
  }
  if (typeof name === 'undefined' || name === null) {
    name = '';
  }
  if (typeof label === 'undefined' || label === null) {
    label = '';
  }

  cordova.exec(success, error, 'UniversalAnalytics', 'trackTiming', [category, intervalInMilliseconds, name, label]);
};

/* Google Analytics e-Commerce Tracking */
/* https://developers.google.com/analytics/devguides/collection/analyticsjs/ecommerce */
UniversalAnalyticsPlugin.prototype.addTransaction = function(transactionId, affiliation, revenue, tax, shipping, currencyCode, success, error) {
  cordova.exec(success, error, 'UniversalAnalytics', 'addTransaction', [transactionId, affiliation, revenue, tax, shipping, currencyCode]);
};

UniversalAnalyticsPlugin.prototype.addTransactionItem = function(transactionId, name ,sku, category, price, quantity, currencyCode, success, error) {
  cordova.exec(success, error, 'UniversalAnalytics', 'addTransactionItem', [transactionId, name ,sku, category, price, quantity, currencyCode]);
};

/* automatic uncaught exception tracking */
UniversalAnalyticsPlugin.prototype.enableUncaughtExceptionReporting = function (enable, success, error) {
  cordova.exec(success, error, 'UniversalAnalytics', 'enableUncaughtExceptionReporting', [enable]);
};

module.exports = new UniversalAnalyticsPlugin();
