google-analytics-plugin
=======================
[![npm](https://img.shields.io/npm/v/cordova-plugin-google-analytics.svg)](https://www.npmjs.com/package/cordova-plugin-google-analytics)
[![npm](https://img.shields.io/npm/dt/cordova-plugin-google-analytics.svg?label=npm%20downloads)](https://www.npmjs.com/package/cordova-plugin-google-analytics)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)

Cordova (PhoneGap) 3.0+ Plugin to connect to Google's native Universal Analytics SDK

Prerequisites:
* A Cordova 3.0+ project for iOS, Android, browser (PWA), Windows Phone 8 and/or Windows 10 (UWP)
* A Mobile App property through the Google Analytics Admin Console
* (Android) Google Play Services SDK installed via [Android SDK Manager](https://developer.android.com/sdk/installing/adding-packages.html)

# Installing

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

The plugin.xml file will add the Google Analytics SDK files for Android, iOS, browser (PWA), Windows Phone 8 and/or Windows 10 (UWP).  Follow [Google's steps](#sdk-files) if you need to update these later.  Also make sure to review the Google Analytics [terms](http://www.google.com/analytics/terms/us.html) and [SDK Policy](https://developers.google.com/analytics/devguides/collection/protocol/policy)

If you are not using the CLI, follow the steps in the section [Installing Without the CLI](#nocli)

Windows Phone users have to manually add the [Google Analytics SDK for Windows 8 and Windows Phone](https://googleanalyticssdk.codeplex.com/) to your solution. To do this, just open your Cordova solution in Visual Studio, and add the [GoogleAnalyticsSDK package via NuGet](http://nuget.org/packages/GoogleAnalyticsSDK). This plugin requires v1.3.0 or higher.

Windows 10 (UWP) users have to manually add the [Windows SDK for Google Analytics](https://github.com/dotnet/windows-sdk-for-google-analytics) to your solution. To do this, just open your Cordova solution in Visual Studio, and add the [UWP.SDKforGoogleAnalytics.Native package via NuGet](http://nuget.org/packages/UWP.SDKforGoogleAnalytics.Native). This plugin requires v1.5.2 or higher.

# Release note

v1.0.0 -- api change from ```window.analytics``` to ```window.ga```, 'analytics' is deprecated since 1.0.0 and you should use the new api 'ga',
because in the next release we are removing the analytics.

v1.7.x -- since this version there are new parameters in some of the old methods like `startTrackerWithId('UA-XXXX-YY', 30)` 
and this is causing errors for those who are using the ionic 2(ionic-native) or ionic 1 (ngCordova); 
these wrapper interfaces don't have the new parameters at the time we did the changes; so please update you ionic framework to the lastest version.

v1.7.11 -- since this version there is back compatibility with the new and old parameters in the method `startTrackerWithId('UA-XXXX-YY', 30)` to avoid loading issues reported.

v1.9.0 -- since this version the windows platform is supported.

# JavaScript Usage

**All the following methods accept optional success and error callbacks after all other available parameters.**

```js
//In your 'deviceready' handler, set up your Analytics tracker:
window.ga.startTrackerWithId('UA-XXXX-YY', 30)
//where UA-XXXX-YY is your Google Analytics Mobile App property and 30 is the dispatch period (optional)

//To track a Screen (PageView):
window.ga.trackView('Screen Title')

//To track a Screen (PageView) w/ campaign details:
window.ga.trackView('Screen Title', 'my-scheme://content/1111?utm_source=google&utm_campaign=my-campaign')

//To track a Screen (PageView) and create a new session:
window.ga.trackView('Screen Title', '', true)

//To track an Event:
window.ga.trackEvent('Category', 'Action', 'Label', Value)// Label and Value are optional, Value is numeric

//To track an Event and create a new session:
window.ga.trackEvent('Category', 'Action', 'Label', Value, true)// Label, Value and newSession are optional, Value is numeric, newSession is true/false

//To track custom metrics:
//(trackMetric doesn't actually send a hit, it's behaving more like the addCustomDimension() method.
// The metric is afterwards added to every hit (view, event, error, etc...) sent, but the defined scope of the custom metric in analytics backend
//   (hit or product) will determine, at processing time, which hits are associated with the metric value.)
window.ga.trackMetric(Key, Value) // Key and value are numeric type, Value is optional (omit value to unset metric)

//To track an Exception:
window.ga.trackException('Description', Fatal)//where Fatal is boolean

//To track User Timing (App Speed):
window.ga.trackTiming('Category', IntervalInMilliseconds, 'Variable', 'Label') // where IntervalInMilliseconds is numeric

//To add a Transaction (Ecommerce) -- Deprecated on 1.9.0 will be removed on next minor version (1.10.0).
window.ga.addTransaction('ID', 'Affiliation', Revenue, Tax, Shipping, 'Currency Code')// where Revenue, Tax, and Shipping are numeric

//To add a Transaction Item (Ecommerce) -- Deprecated on 1.9.0 will be removed on next minor version (1.10.0).
window.ga.addTransactionItem('ID', 'Name', 'SKU', 'Category', Price, Quantity, 'Currency Code')// where Price and Quantity are numeric

//To add a Custom Dimension
//(The dimension is afterwards added to every hit (view, event, error, etc...) sent, but the defined scope of the custom dimension in analytics backend
//   (hit or product) will determine, at processing time, which hits are associated with the dimension value.)
window.ga.addCustomDimension(Key, 'Value', success, error)
//Key should be integer index of the dimension i.e. send `1` instead of `dimension1` for the first custom dimension you are tracking. e.g. `window.ga.addCustomDimension(1, 'Value', success, error)`
//Use empty string as value to unset custom dimension.

//To set a UserId:
window.ga.setUserId('my-user-id')

//To set a specific app version:
window.ga.setAppVersion('1.33.7')

//To get a specific variable using this key list https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters:
//for example to get campaign name:
window.ga.getVar('cn', function(result){ console.log(result);})

//To set a specific variable using this key list https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters:
//for example to set session control:
window.ga.setVar('sc', 'end', function(result){ console.log(result);})

//To manually dispatch any data (this is not implemented in browser platform):
window.ga.dispatch()

//To set a anonymize Ip address:
window.ga.setAnonymizeIp(true)

//To set Opt-out:
window.ga.setOptOut(true)

//To enabling Advertising Features in Google Analytics allows you to take advantage of Remarketing, Demographics & Interests reports, and more:
window.ga.setAllowIDFACollection(true)

To enable verbose logging:
window.ga.debugMode()
// set's dry run mode on Android and Windows platform, so that all hits are only echoed back by the google analytics service and no actual hit is getting tracked!
// **Android quirk**: verbose logging within javascript console is not supported. To see debug responses from analytics execute 
// `adb shell setprop log.tag.GAv4 DEBUG` and then `adb logcat -v time -s GAv4` to list messages 
// (see https://developers.google.com/android/reference/com/google/android/gms/analytics/Logger)

//To enable/disable automatic reporting of uncaught exceptions
window.ga.enableUncaughtExceptionReporting(Enable, success, error)// where Enable is boolean
```

# Example use ionic 2 (Ionic Native)
```shell
npm i --save @ionic-native/google-analytics
```
```javascript
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { Platform } from 'ionic-angular';

...

  constructor(private ga: GoogleAnalytics, private platform: Platform) { }
  
  initializeApp() {
    this.platform.ready().then(() => {
      this.ga.startTrackerWithId('UA-00000000-0')
        .then(() => {
          console.log('Google analytics is ready now');
          //the component is ready and you can call any method here
          this.ga.debugMode();
          this.ga.setAllowIDFACollection(true);
        })
        .catch(e => console.log('Error starting GoogleAnalytics', e));      
    });
  }
```

**Issue for using trackMetric in Ionic 2**: currently `@ionic-native/google-analytics` defines the typescript signature with `trackMetric(key: string, value?: any)`.
So be aware to pass the metric index as a string formatted integer and a non empty string as a value, like `window.ga.trackMetric('1', 'Value', success, error)`!

# Installing Without the CLI <a name="nocli"></a>

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
```xml
<feature name="UniversalAnalytics">
  <param name="wp-package" value="UniversalAnalyticsPlugin" />
</feature>
```
<a name="sdk-files"></a>
You also will need to manually add the Google Analytics SDK files:
* Download the Google Analytics SDK 3.0 for [iOS](https://developers.google.com/analytics/devguides/collection/ios/) and/or [Android](https://developers.google.com/analytics/devguides/collection/android/)
* For iOS, add the downloaded Google Analytics SDK header files and libraries according to the [Getting Started](https://developers.google.com/analytics/devguides/collection/ios/v3) documentation
* For Android, add `libGoogleAnalyticsServices.jar` to your Cordova Android project's `/libs` directory and build path
* For Windows Phone, add the [GoogleAnalyticsSDK package via NuGet](http://nuget.org/packages/GoogleAnalyticsSDK)
* For Windows 10 (UWP), add the [UWP.SDKforGoogleAnalytics.Native package via NuGet](http://nuget.org/packages/UWP.SDKforGoogleAnalytics.Native)

# Integrating with Lavaca

The `lavaca` directory includes a component that can be added to a <a href="http://getlavaca.com">Lavaca</a> project.  It offers a way to use the web `analytics.js` when the app is running in the browser and not packaged as Cordova.

* Copy `AnalyticsService.js` to your Lavaca project (I create a directory under `js/app` called `data`).
* In your config files (`local.json`, `staging.json`, `production.js`) create properties called `google_analytics_id` (for the Mobile App UA property) and `google_analytics_web_id` (for the Web UA property) and set the appropriate IDs or leave blank as needed.
* In any file you want to track screen views or events, require AnalyticsService and use the methods provided.

```javascript
var analyticsService = require('app/data/AnalyticsService');

analyticsService.trackView('Home');
```

# Browser (PWA)

For browser (PWA), people who want to use the plugin in a website that has already integrated google analytics needs 
to make sure that they remove the google analytics snippet from the head section of the page and change the global `ga` 
object name to something else. The plugin uses `nativeGa` instead. This can be changed by the following code.

```js
// insert this in your head
<script>
window['GoogleAnalyticsObject'] = 'fooGa';
</script>
```

The plugin will pick up the new name.

# Windows 10 (UWP)

The following plugin methods are (currently) not supported by the UWP.SDKforGoogleAnalytics.Native package:
* `setAllowIDFACollection()`
* `addTransaction()`
* `addTransactionItem()`

Unexpected behaviour may occur on the following methods:
* `trackView()`: campaign details are currently not supported and therefore not tracked.
* `trackMetric()`: there is currently a bug in version 1.5.2 of the [UWP.SDKforGoogleAnalytics.Native package via NuGet](http://nuget.org/packages/UWP.SDKforGoogleAnalytics.Native),
that the wrong data specifier `cd` is taken for metrics, whereas `cm` should be the correct specifier.
So as long as this bug is not fixed, trackMetrics will overwrite previous addCustomDimension with same index!!

