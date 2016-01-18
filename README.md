google-analytics-plugin
=======================

Cordova (PhoneGap) 3.0+ Plugin to connect to Google's native Universal Analytics SDK

Prerequisites:
* A Cordova 3.0+ project for iOS and/or Android
* A Mobile App property through the Google Analytics Admin Console
* (Android) Google Play Services SDK installed via [Android SDK Manager](https://developer.android.com/sdk/installing/adding-packages.html)

#Installing

This plugin follows the Cordova 3.0+ plugin spec, so it can be installed through the Cordova CLI in your existing Cordova project:
```bash
cordova plugin add https://github.com/danwilson/google-analytics-plugin.git
```

This plugin is also available on npm if you are using Cordova 5.0+:
```bash
cordova plugin add cordova-plugin-google-analytics
```

... OR the Cordova Plugin Registry if you are using a version of Cordova before 5.0 (while it remains open, as it is planning to shut down soon due to the move to npm):
```bash
cordova plugin add com.danielcwilson.plugins.googleanalytics
```

*Important Note* If the latest versions (0.8.0+) of this plugin are not working for you with Android on Cordova 5.0+, please try the suggestions in [Issues 123](https://github.com/danwilson/google-analytics-plugin/issues/123#issuecomment-151145095). Google Play Services has been very confusing to integrate, but in recent months it has been simplified.  This plugin uses the new simpler way (including it as a framework instead of bundling it which can conflict with other plugins bundling it), but if you previously installed this plugin some old files might still be lingering.

The plugin.xml file will add the Google Analytics SDK files for Android and/or iOS.  Follow [Google's steps](#sdk-files) if you need to update these later.  Also make sure to review the Google Analytics [terms](http://www.google.com/analytics/terms/us.html) and [SDK Policy](https://developers.google.com/analytics/devguides/collection/protocol/policy)

If you are not using the CLI, follow the steps in the section [Installing Without the CLI](#nocli)

#JavaScript Usage

```js
// in your 'deviceready' handler, set up your analytics tracker:
window.analytics.startTrackerWithId('UA-XXXX-YY') where UA-XXXX-YY is your Google Analytics Mobile App property

// track pageview
window.analytics.trackView('Screen Title')

// track event: (label/value optional, value is numeric)
window.analytics.trackEvent('Category', 'Action', 'Label', Value)

// track exception: 
window.analytics.trackException('Description', fatal)

// track user timing: (intervalInMilliseconds is numeric)
window.analytics.trackTiming('Category', intervalInMilliseconds, 'Variable', 'Label')

// add ecommerce transaction (revenue, tax, and shipping are numeric)
window.analytics.addTransaction('ID', 'Affiliation', revenue, tax, shipping, 'Currency Code')

// add ecommerce transaction item (price and quantity are numeric)
window.analytics.addTransactionItem('ID', 'Name', 'SKU', 'Category', price, quantity, 'Currency Code')

// add custom dimension
window.analytics.addCustomDimension('Key', 'Value', success, error)

// set userid:
window.analytics.setUserId('my-user-id')

// enable verbose logging:
window.analytics.debugMode()

// enable/disable automatic reporting of uncaught exceptions
window.analytics.enableUncaughtExceptionReporting(Enable, success, error) where Enable is boolean
```

#Installing Without the CLI <a name="nocli"></a>
Copy the files manually into your project and add the following to your config.xml files:
```xml
<feature name="UniversalAnalytics">
  <param name="ios-package" value="UniversalAnalyticsPlugin" />
</feature>
```
```xml
<feature name="UniversalAnalytics">
  <param name="android-package" value="com.danielcwilson.plugins.analytics.UniversalAnalyticsPlugin" />
</feature>
```
<a name="sdk-files"></a>
You also will need to manually add the Google Analytics SDK files:
* Download the Google Analytics SDK 3.0 for [iOS](https://developers.google.com/analytics/devguides/collection/ios/) and/or [Android](https://developers.google.com/analytics/devguides/collection/android/)
* For iOS, add the downloaded Google Analytics SDK header files and libraries according to the [Getting Started](https://developers.google.com/analytics/devguides/collection/ios/v3) documentation
* For Android, add `libGoogleAnalyticsServices.jar` to your Cordova Android project's `/libs` directory and build path

#Integrating with Lavaca
The `lavaca` directory includes a component that can be added to a <a href="http://getlavaca.com">Lavaca</a> project.  It offers a way to use the web `analytics.js` when the app is running in the browser and not packaged as Cordova.

* Copy `AnalyticsService.js` to your Lavaca project (I create a directory under `js/app` called `data`).
* In your config files (`local.json`, `staging.json`, `production.js`) create properties called `google_analytics_id` (for the Mobile App UA property) and `google_analytics_web_id` (for the Web UA property) and set the appropriate IDs or leave blank as needed.
* In any file you want to track screen views or events, require AnalyticsService and use the methods provided.

```javascript
var analyticsService = require('app/data/AnalyticsService');

analyticsService.trackView('Home');
```
