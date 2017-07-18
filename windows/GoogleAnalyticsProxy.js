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
    console.warn("**hit malformed** \n" + args.httpStatusCode, parseHit(args.hit));
}

function onHitFailed(args) {
    console.error("**hit failed**\n" + args.error.message, parseHit(args.hit));
}

function onHitSent(args) {
    console.log("Analytics result: " + args.response, parseHit(args.hit));
}

function parseHit(hit) {
    var pair;
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
