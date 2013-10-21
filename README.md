google-analytics-plugin
=======================

Cordova (PhoneGap) 3.0+ Plugin to connect to Google's native Universal Analytics SDK 3.0

Prerequisites:
* A Cordova 3.0+ project for iOS and/or Android
* A Mobile App property through the Google Analytics Admin Console
* Download the Google Analytics SDK 3.0 for [iOS](https://developers.google.com/analytics/devguides/collection/ios/) and/or [Android](https://developers.google.com/analytics/devguides/collection/android/)
* For iOS, add the downloaded Google Analytics SDK header files and libraries according to the [Getting Started](https://developers.google.com/analytics/devguides/collection/ios/v3) documentation
* For Android, add `libGoogleAnalyticsServices.jar` to your Cordova Android project's `/libs` directory and build path

#Installing

This plugin follows the Cordova 3.0 plugin spec, so it can be installed through the Cordova CLI in your existing Cordova project:
```bash
cordova plugin add https://github.com/danwilson/google-analytics-plugin.git
```
#JavaScript Usage
In your 'deviceready' handler, set up your Analytics tracker:
* `analytics.startTrackerWithId('UA-XXXX-YY')` where UA-XXXX-YY is your Google Analytics Mobile App property

To track a Screen (PageView):
* `analytics.trackView('Screen Title')`

To track an Event:
* `analytics.trackEvent('Category', 'Action', 'Label')` Label is optional



