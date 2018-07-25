function UniversalAnalyticsProxy() {
  this._isDebug = false;
  this._isEcommerceRequired = false;
  this._trackingId = null;

  var namespace = window.GoogleAnalyticsObject || 'nativeGa';
  loadGoogleAnalytics.call(this, namespace);

  bindAll(this, [
    '_ensureEcommerce',
    '_uncaughtExceptionHandler',
    'addCustomDimension',
    'addTransaction',
    'addTransactionItem',
    'debugMode',
    'enableUncaughtExceptionReporting',
    'setAllowIDFACollection',
    'setAnonymizeIp',
    'setAppVersion',
    'setOptOut',
    'setUserId',
    'getVar',
    'setVar',
    'startTrackerWithId',
    'trackEvent',
    'trackException',
    'trackMetric',
    'trackTiming',
    'trackView'
  ]);
}

UniversalAnalyticsProxy.prototype = {
  startTrackerWithId: wrap(function (trackingId) {
    this._trackingId = trackingId;

    this._ga('create', {
      trackingId: trackingId,
      cookieDomain: 'auto'
    });
    this._ga('set', 'appName', document.title);
  }),

  setUserId: wrap(function (userId) {
    this._ga('set', 'userId', userId);
  }),

  setAnonymizeIp: wrap(function (anonymize) {
    this._ga('set', 'anonymizeIp', anonymize);
  }),

  setOptOut: wrap(function (optout) {
    if (!this._trackingId) {
      throw new Error('TrackingId not available');
    }
    window['ga-disable-' + this._trackingId] = optout;
  }),

  setAppVersion: wrap(function (version) {
    this._ga('set', 'appVersion', version);
  }),

  setAllowIDFACollection: wrap(function (enable) {
    // Not supported by browser platofrm
  }),

  getVar: function (success, error, param) {
    this._ga(function(tracker){
      success(tracker.get(param));
    });
  },

  setVar: wrap(function(param, value){
    this._ga('set', param, value);
  }),

  debugMode: wrap(function () {
    this._isDebug = true;
  }),

  addCustomDimension: wrap(function (key, value) {
    this._ga('set', 'dimension' + key, value);
  }),

  trackMetric: wrap(function (key, value) {
    this._ga('set', 'metric' + key, value);
  }),

  trackEvent: send(function (category, action, label, value, newSession) {
    return {
      hitType: 'event',
      eventCategory: category,
      eventAction: action,
      eventLabel: label,
      eventValue: value
    };
  }),

  trackView: send(function (screen) {
    return {
      hitType: 'screenview',
      screenName: screen
    };
  }),

  trackException: send(function (description, fatal) {
    return {
      hitType: 'exception',
      exDescription: description,
      exFatal: fatal
    };
  }),

  trackTiming: send(function (category, intervalInMilliseconds, name, label) {
    return {
      hitType: 'timing',
      timingCategory: category,
      timingVar: name,
      timingValue: intervalInMilliseconds,
      timingLabel: label
    };
  }),

  addTransaction: wrap(function (transactionId, affiliation, revenue, tax, shipping, currencyCode) {
    this._ensureEcommerce();
    this._ga('ecommerce:addTransaction', {
      id: transactionId,
      affiliation: affiliation,
      revenue: String(revenue),
      shipping: String(shipping),
      tax: String(tax),
      currency: currencyCode
    });
  }),

  addTransactionItem: wrap(function (transactionId, name, sku, category, price, quantity, currencyCode) {
    this._ensureEcommerce();
    this._ga('ecommerce:addItem', {
      id: transactionId,
      name: name,
      sku: sku,
      category: category,
      price: String(price),
      quantity: String(quantity),
      currency: currencyCode
    });
  }),

  enableUncaughtExceptionReporting: wrap(function (enable) {
    if (enable) {
      window.addEventListener('error', this._uncaughtExceptionHandler);
    } else {
      window.removeEventListener('error', this._uncaughtExceptionHandler);
    }
  }),

  _ga: function () {
    var args = Array.prototype.slice.call(arguments);
    if (this._isDebug) {
      console.debug('UniversalAnalyticsProxy', args);
    }
    this._nativeGa.apply(this._nativeGa, args);
  },

  _uncaughtExceptionHandler: function (err) {
    this._ga('send', {
      hitType: 'exception',
      exDescription: err.message,
      exFatal: true
    });
  },

  _ensureEcommerce: function() {
    if (this._isEcommerceRequired) return;
    this._ga('require', 'ecommerce');
    this._isEcommerceRequired = true;
  }
};

function send(fn) {
  return function (success, error, args) {
    var command = fn.apply(this, args);
    var timeout = setTimeout(function () {
      error(new Error('send timeout'));
    }, 3000);

    command.hitCallback = function hitCallback(result) {
      clearTimeout(timeout);
      success(result);
    };

    try {
      this._ga('send', command);
    } catch (err) {
      clearTimeout(timeout);
      defer(error, err);
    }
  };
}

function bindAll(that, names) {
  names.forEach(function(name) {
    if (typeof that[name] === 'function') {
      that[name] = that[name].bind(that);
    }
  });
}

/**
 * Proceed to the asynchronous loading of Google's analytics.js.
 * Initialize `this._nativeGa` once the script is loaded, using
 * the `onload` callback of the `script` DOM node.
 *
 * @param {string} name Reference (global namespace) of the GA object.
 */
function loadGoogleAnalytics(name) {
  window.GoogleAnalyticsObject = name;

  window[name] = window[name] || function () {
    (window[name].q = window[name].q || []).push(arguments);
  };
  window[name].l = 1 * new Date();
  this._nativeGa = window[name];

  var script = document.createElement('script');
  var scripts = document.getElementsByTagName('script')[0];
  script.src = 'https://www.google-analytics.com/analytics.js';
  script.async = 1;
  scripts.parentNode.insertBefore(script, scripts);

  // analytics.js creates a new object once initialized, update our reference
  script.onload = (function() { this._nativeGa = window[name]; }).bind(this);
}

function wrap(fn) {
  return function (success, error, args) {
    try {
      fn.apply(this, args);
      setTimeout(success, 0);
    } catch (err) {
      defer(error, err);
    }
  };
}

function defer(fn) {
  var args = Array.prototype.slice.call(arguments, 1);
  setTimeout(function () {
    fn.apply(null, args);
  }, 0);
}

require('cordova/exec/proxy').add('UniversalAnalytics', new UniversalAnalyticsProxy());
