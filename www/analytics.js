function UniversalAnalyticsPlugin() {}

UniversalAnalyticsPlugin.prototype.startTrackerWithId = function(id, dispatchPeriod, success, error) {
  if (typeof dispatchPeriod === 'undefined' || dispatchPeriod === null) {
    dispatchPeriod = 30;
  } else if (typeof dispatchPeriod === 'function' && typeof error === 'undefined') {
    // Called without dispatchPeriod but with a callback.
    // Looks like the original API was used so shift parameters over to remain compatible.
    error = success;
    success = dispatchPeriod;
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

UniversalAnalyticsPlugin.prototype.getVar = function(variable, success, error) {
  cordova.exec(success, error, 'UniversalAnalytics', 'getVar', [variable]);
};

UniversalAnalyticsPlugin.prototype.setVar = function(variable, value, success, error) {
  cordova.exec(success, error, 'UniversalAnalytics', 'setVar', [variable, value]);
};

UniversalAnalyticsPlugin.prototype.dispatch = function(success, error) {
  cordova.exec(success, error, 'UniversalAnalytics', 'dispatch', []);
};

/* enables verbose logging */
UniversalAnalyticsPlugin.prototype.debugMode = function(success, error) {
  cordova.exec(success, error, 'UniversalAnalytics', 'debugMode', []);
};

UniversalAnalyticsPlugin.prototype.trackMetric = function(key, value, success, error) {
  // as key was formerly documented to be of type string, 
  // we need to at least accept string formatted numbers and pass the converted number
  var numberKey = key;
  if (typeof key === "string") {
    numberKey = Number.parseInt(key);
    if (isNaN(numberKey)) {
      throw Error("key must be a valid integer or string formatted integer");
    }
  }

  // as value was formerly documented to be of type string
  // and therefore platform implementations expect value parameter of type string,
  // we need to cast the value parameter to string - although gathered metrics are infact number types.
  var stringValue = value || "";
  if (typeof stringValue !== "string") {
    stringValue = String(value);
  }
  cordova.exec(success, error, 'UniversalAnalytics', 'trackMetric', [numberKey, stringValue]);
};

UniversalAnalyticsPlugin.prototype.trackView = function(screen, campaignUrl, newSession, success, error) {
  if (typeof campaignUrl === 'undefined' || campaignUrl === null) {
    campaignUrl = '';
  }

  if (typeof newSession === 'undefined' || newSession === null) {
    newSession = false;
  }  

  cordova.exec(success, error, 'UniversalAnalytics', 'trackView', [screen, campaignUrl, newSession]);
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
