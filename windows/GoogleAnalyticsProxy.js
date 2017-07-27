/* global GoogleAnalytics */

var _supported = null; // set to null so we can check first time
var _tracker = null;
var _customDimensions = {};
var _customMetrics = {};

function isSupported() {
    // if not checked before, run check
    if (_supported === null) {
        _supported = (GoogleAnalytics && GoogleAnalytics.AnalyticsManager && GoogleAnalytics.AnalyticsManager.current &&
            GoogleAnalytics.HitBuilder);
    }
    return _supported;
}

function isTrackerStarted() {
    return (_tracker !== null);
}

function getAnalyticsManager() {
    if (!isSupported()) {
        throw new Error("Google Analytics is not supported");
    }
    return GoogleAnalytics.AnalyticsManager.current;
}

function getTracker() {
    if (!isSupported()) {
        throw new Error("Google Analytics is not supported");
    } else if (!isTrackerStarted()) {
        throw new Error("Tracker not started");
    }
    return _tracker;
}

// extended debug support

function onHitMalformed(args) {
    console.warn("**Google Analytics hit malformed**\n" + args.httpStatusCode);
    console.warn("Hit data:\n", parseHit(args.hit));
}

function onHitFailed(args) {
    console.error("**Google Analytics hit failed**\n" + args.error.message);
    console.error("Hit data:\n", parseHit(args.hit));
}

function onHitSent(args) {
    console.log("**Google Analytics hit succeeded**\n" + args.response);
    console.log("Hit data:\n", parseHit(args.hit));
}

function parseHit(hit) {
    var result = "";
    var iter = hit.data.first();
    while (iter.hasCurrent) {
        result += iter.current.key;
        result += ":";
        result += iter.current.value;
        result += "\n";
        iter.moveNext();
    }
    return result;
}

function uncaughtExceptionHandler(err) {
    console.error(err);
    try {
        var hit = GoogleAnalytics.HitBuilder.createException(err.message, true);

        // add previously added custom dimensions and metrics
        hit = addCustomDimensionsAndMetrics(hit);

        const data = hit.build();
        getTracker().send(data);
    } catch (ex) {
        console.error(ex);
    }
    return true;
}

function addCustomDimensionsAndMetrics(hitBuilder) {
    if (hitBuilder) {
        // add previously added custom dimensions
        for (var key in _customDimensions) {
            if (_customDimensions.hasOwnProperty(key)) {
                hitBuilder = hitBuilder.setCustomDimension(key, _customDimensions[key]);
            }
        }

        // add previously added custom metrics
        for (var key in _customMetrics) {
            if (_customMetrics.hasOwnProperty(key)) {
                hitBuilder = hitBuilder.setCustomMetric(key, _customMetrics[key]);
            }
        }
    }
    return hitBuilder;
}

module.exports = {

    setOptOut: function (win, fail, args) {
        if (!args || args.length === 0 || typeof args[0] !== "boolean") {
            fail("Expected boolean argument");
            return;
        }

        getAnalyticsManager().appOptOut = args[0];
        win();
    },

    enableUncaughtExceptionReporting: function (win, fail, args) {
        if (!args || args.length === 0 || typeof args[0] !== "boolean") {
            fail("Expected boolean argument");
            return;
        }

        // set analytics property
        getAnalyticsManager().reportUncaughtExceptions = args[0];

        // hook global javascript error handler
        if (WinJS && WinJS.Application && typeof WinJS.Application.addEventListener === "function") {
            if (args[0]) {
                WinJS.Application.addEventListener('error', uncaughtExceptionHandler);
            } else {
                WinJS.Application.removeEventListener('error', uncaughtExceptionHandler);
            }
        }

        win();
    },

    dispatch: function (win, fail, args) {
        getAnalyticsManager().dispatchAsync().done(win, fail);
    },

    debugMode: function (win, fail, args) {
        const ga = getAnalyticsManager();
        ga.isDebug = true;

        // hook debug events
        ga.addEventListener("hitfailed", onHitFailed);
        ga.addEventListener("hitsent", onHitSent);
        ga.addEventListener("hitmailformed", onHitMalformed);

        win();
    },

    startTrackerWithId: function (win, fail, args) {
        if (!args || args.length === 0 || args[0] === "") {
            fail("Expected non empty string argument");
            return;
        }

        if (args.length >= 2 && !Number.isInteger(args[1])) {
            fail("Expected numeric integer argument");
            return;
        }

        if (isTrackerStarted()) {
            fail("Tracker already started!");
            return;
        }

        const ga = getAnalyticsManager();
        // important! do fire events on ui thread
        // (otherwise unhandled exceptions can occur on delayed dispatch..)
        ga.fireEventsOnUIThread = true;

        // set dispatch period
        if (args.length > 1) {
            ga.dispatchPeriod = args[1] * 1000;
        }
        _tracker = ga.createTracker(args[0]);
        win();
    },

    setUserId: function (win, fail, args) {
        if (!args || args.length === 0 || args[0] === "") {
            fail("Expected non empty string argument");
            return;
        }

        getTracker().clientId = args[0];
        win();
    },

    setAnonymizeIp: function (win, fail, args) {
        if (!args || args.length === 0 || typeof args[0] !== "boolean") {
            fail("Expected boolean argument");
            return;
        }

        getTracker().anonymizeIP = args[0];
        win();
    },

    setAllowIDFACollection: function () {
        // not supported
        fail("not supported on Windows platform");
    },

    setAppVersion: function (win, fail, args) {
        if (!args || args.length === 0 || args[0] === "") {
            fail("Expected non empty string argument");
            return;
        }

        getTracker().appVersion = args[0];
        win();
    },

    getVar: function (win, fail, args) {
        if (!args || args.length === 0 || args[0] === "") {
            fail("Expected non empty string argument");
            return;
        }

        const value = getTracker().get(args[0]);
        win(value);
    },

    setVar: function (win, fail, args) {
        if (!args || args.length === 0 || args[0] === "") {
            fail("Expected non empty string argument");
            return;
        }

        getTracker().set(args[0], args[1]);
        win();
    },

    trackMetric: function (win, fail, args) {
        if (!args || args.length === 0 || !Number.isInteger(args[0]) || args[0] < 0) {
            fail("Expected positive numeric integer argument");
            return;
        }

        if (args.length < 1 || args[1] === null || typeof args[1] === "undefined" || args[1] === "") {
            // unset metric
            delete _customMetrics[args[0]];
            win("custom metric stopped");
        } else {
            var value = args[1];
            if (typeof args[1] !== "number") {
                if (typeof args[1] !== "string") {
                    fail("Expected either numeric or string formatted number argument");
                    return;
                }
                value = Number.parseFloat(args[1]);
                if (isNaN(value)) {
                    fail("Expected either numeric or string formatted number argument");
                    return;
                }
            }

            _customMetrics[args[0]] = value;
            win("custom metric started");
        }
    },

    addCustomDimension: function (win, fail, args) {
        if (!args || args.length === 0 || !Number.isInteger(args[0]) || args[0] < 0) {
            fail("Expected positive numeric integer argument");
            return;
        }

        if (args.length < 1 || args[1] === null || typeof args[1] === "undefined" || args[1] === "") {
            // unset dimension
            delete _customDimensions[args[0]];
            win("custom dimension stopped");
        } else {
            _customDimensions[args[0]] = args[1];
            win("custom dimension started");
        }
    },

    addTransaction: function (win, fail, args) {
        // not supported
        fail("not supported on Windows platform");
    },

    addTransactionItem: function (win, fail, args) {
        // not supported
        fail("not supported on Windows platform");
    },

    productAction: function (win, fail, args) {
        if (!args || args.length === 0 || args[0] === "") {
            fail("Expected non empty string argument");
            return;
        }
        if (args.length < 2 || typeof args[1] !== "object") {
            fail("Expected non object argument");
            return;
        }
        if (args.length < 3 || typeof args[2] !== "object") {
            fail("Expected non object argument");
            return;
        }

        var product = new GoogleAnalytics.Ecommerce.Product();
        product.id = args[1].id;
        product.name = args[1].name;
        if (typeof args[1].position !== "undefined") {
            product.position = args[1].position;
        }
        if (typeof args[1].price !== "undefined") {
            product.price = args[1].price;
        }
        if (typeof args[1].quantity !== "undefined") {
            product.quantity = args[1].quantity;
        }
        if (typeof args[1].variant !== "undefined") {
            product.variant = args[1].variant;
        }
        if (typeof args[1].brand !== "undefined") {
            product.brand = args[1].brand;
        }
        if (typeof args[1].category !== "undefined") {
            product.category = args[1].category;
        }
        if (typeof args[1].couponCode !== "undefined") {
            product.couponCode = args[1].couponCode;
        }
        // RETHINK! (should support multiple dimensions and metrics..)
        if (typeof args[1].customDimension !== "undefined" && args[1].customDimension.length === 2) {
            product.customDimensions.insert(args[1].customDimension[0], args[1].customDimension[1]);
        }
        if (typeof args[1].customMetric !== "undefined" && args[1].customMetric.length === 2) {
            product.customMetrics.insert(args[1].customMetric[0], args[1].customMetric[1]);
        }

        var action = "";
        switch (args[2].action) {
            case "ACTION_ADD":
                action = "Add";
                break;
            case "ACTION_CHECKOUT":
                action = "Checkout";
                break;
            case "ACTION_CHECKOUT_OPTION":
            case "ACTION_CHECKOUT_OPTIONS":
                action = "CheckoutOption";
                break;
            case "ACTION_CLICK":
                action = "Click";
                break;
            case "ACTION_DETAIL":
                action = "Detail";
                break;
            case "ACTION_PURCHASE":
                action = "Purchase";
                break;
            case "ACTION_REFUND":
                action = "Refund";
                break;
            case "ACTION_REMOVE":
                action = "Remove";
                break;
        }
        var action = new GoogleAnalytics.Ecommerce.ProductAction(action);
        if (typeof args[2].checkoutOptions !== "undefined") {
            action.checkoutOptions = args[2].checkoutOptions;
        }
        if (typeof args[2].checkoutStep !== "undefined") {
            action.checkoutStep = args[2].checkoutStep;
        }
        if (typeof args[2].transactionAffiliation !== "undefined") {
            action.transactionAffiliation = args[2].transactionAffiliation;
        }
        if (typeof args[2].transactionCouponCode !== "undefined") {
            action.transactionCouponCode = args[2].transactionCouponCode;
        }
        if (typeof args[2].transactionId !== "undefined") {
            action.transactionId = args[2].transactionId;
        }
        if (typeof args[2].transactionRevenue !== "undefined") {
            action.transactionRevenue = args[2].transactionRevenue;
        }
        if (typeof args[2].transactionShipping !== "undefined") {
            action.transactionShipping = args[2].transactionShipping;
        }
        if (typeof args[2].transactionTax !== "undefined") {
            action.transactionTax = args[2].transactionTax;
        }

        var hit = GoogleAnalytics.HitBuilder.createScreenView(args[0]).addProduct(product).setProductAction(action);

        const data = hit.build();
        getTracker().send(data);
        win();
    },

    addPromotion: function (win, fail, args) {
        if (!args || args.length === 0 || args[0] === "") {
            fail("Expected non empty string argument");
            return;
        }
        if (args.length < 2 || typeof args[1] !== "object") {
            fail("Expected non object argument");
            return;
        }
        if (args.length < 3 || args[2] === "") {
            fail("Expected non empty string argument");
            return;
        }
        if (args.length < 4 || args[3] === "") {
            fail("Expected non empty string argument");
            return;
        }

        var hit = GoogleAnalytics.HitBuilder.createCustomEvent(args[3], args[0], args[2] || null, 0);

        var promotion = new GoogleAnalytics.Ecommerce.Promotion();
        promotion.id = args[1].id;
        promotion.name = args[1].name;
        if (typeof args[1].position !== "undefined") {
            promotion.position = args[1].position;
        }
        if (typeof args[1].creative !== "undefined") {
            promotion.creative = args[1].creative;
        }

        hit = hit.addPromotion(promotion);

        var action = "";
        switch (args[0]) {
            case "ACTION_CLICK":
                action = "Click";
                break;
            case "ACTION_VIEW":
                action = "View";
                break;
        }
        if (action !== "") {
            hit = hit.setPromotionAction(action);
        }

        const data = hit.build();
        getTracker().send(data);
        win();
    },

    addImpression: function (win, fail, args) {
        // not supported
        fail("not supported on Windows platform");
    },

    trackView: function (win, fail, args) {
        if (!args || args.length === 0 || args[0] === "") {
            fail("Expected non empty string argument");
            return;
        }

        var hit = GoogleAnalytics.HitBuilder.createScreenView(args[0]);

        // add previously added custom dimensions and metrics
        hit = addCustomDimensionsAndMetrics(hit);

        if (args.length >= 2 && args[1] !== "" && getAnalyticsManager().isDebug === true) {
            console.warn("Campaign details not supported on Windows platform!");
        }

        if (args.length >= 3 && args[2] === true) {
            hit = hit.setNewSession();
        }

        const data = hit.build();
        getTracker().send(data);
        win();
    },

    trackEvent: function (win, fail, args) {
        if (!args || args.length < 2 || args[0] === "" || args[1] === "") {
            fail("Expected non empty string argument");
            return;
        }

        if (args.length >= 4 && !Number.isInteger(args[3])) {
            fail("Expected numeric integer argument");
            return;
        }

        var hit = GoogleAnalytics.HitBuilder.createCustomEvent(args[0], args[1], args[2] || null, args[3] || 0);

        // add previously added custom dimensions and metrics
        hit = addCustomDimensionsAndMetrics(hit);

        const data = hit.build();
        getTracker().send(data);
        win();
    },

    trackException: function (win, fail, args) {
        if (!args || args.length === 0 || args[0] === "") {
            fail("Expected non empty string argument");
            return;
        }

        const fatal = ((args[1] || false) === true);
        var hit = GoogleAnalytics.HitBuilder.createException(args[0], fatal);

        // add previously added custom dimensions and metrics
        hit = addCustomDimensionsAndMetrics(hit);

        const data = hit.build();
        getTracker().send(data);
        win();
    },

    trackTiming: function (win, fail, args) {
        if (!args || args.length === 0 || args[0] === "") {
            fail("Expected non empty string argument");
            return;
        }

        if (args.length < 2 || !Number.isInteger(args[1])) {
            fail("Expected numeric integer argument");
            return;
        }

        if (args.length < 3 || args[2] === "") {
            fail("Expected non empty string argument");
            return;
        }

        var hit = GoogleAnalytics.HitBuilder.createTiming(args[0], args[2] || null,
            args[1] || 0, args[3] || null);

        // add previously added custom dimensions and metrics
        hit = addCustomDimensionsAndMetrics(hit);

        const data = hit.build();
        getTracker().send(data);
        win();
    }

};
require("cordova/exec/proxy").add("UniversalAnalytics", module.exports);
