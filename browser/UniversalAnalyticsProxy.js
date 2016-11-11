(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

function UniversalAnalyticsProxy() {
  this._isDebug = false;
  this._isEcommerceRequired = false;
  this._trackingId = null;

  this._uncaughtExceptionHandler = this._uncaughtExceptionHandler.bind(this);
}

UniversalAnalyticsProxy.prototype = {
  startTrackerWithId: wrap(function (trackingId) {
    this._trackingId = trackingId;

    ga('create', {
      trackingId: trackingId,
      cookieDomain: 'auto'
    });
    ga('set', 'appName', document.title);
  }),

  setUserId: wrap(function (userId) {
    ga('set', 'userId', userId);
  }),

  setAnonymizeIp: wrap(function (anonymize) {
    ga('set', 'anonymizeIp', anonymize);
  }),

  setOptOut: wrap(function (optout) {
    if (!this._trackingId) {
      throw new Error('TrackingId not available');
    }
    window['ga-disable-' + this._trackingId] = optout;
  }),

  setAppVersion: wrap(function (version) {
    ga('set', 'appVersion', version);
  }),

  setAllowIDFACollection: wrap(function (enable) {
    // Not supported by browser platofrm
  }),

  debugMode: wrap(function () {
    this._isDebug = true;
  }),

  addCustomDimension: wrap(function (key, value) {
    ga('set', 'dimension' + key, value);
  }),

  trackMetric: wrap(function (key, value) {
    ga('set', 'metric' + key, value);
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
    ga('ecommerce:addTransaction', {
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
    ga('ecommerce:addItem', {
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

  _uncaughtExceptionHandler: function (err) {
    ga('send', {
      hitType: 'exception',
      exDescription: err.message,
      exFatal: true
    });
  },

  _ensureEcommerce() {
    if (this._isEcommerceRequired) return;
    ga('require', 'ecommerce');
    this._isEcommerceRequired = true;
  }
};

function send(fn) {
  return function (success, error, args) {
    var command = fn.apply(this, args);
    var timeout = setTimeout(function () {
      error(new Error('send timeout'));
    }, 3000);

    command.hitCallback = function hitCallback(result) {
      clearTimeout(timeout);
      success(result);
    };

    try {
      ga('send', command);
    } catch (err) {
      clearTimeout(timeout);
      defer(error, err);
    }
  };
}

function wrap(fn) {
  return function (success, error, args) {
    if (this._isDebug) {
      console.debug('UniversalAnalytics', arguments.callee.name, args);
    }

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
