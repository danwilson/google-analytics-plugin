google-analytics-plugin
=======================

Cordova (PhoneGap) Plugin to connect to the native Google's Universal Analytics SDK 3.0

Prerequisites:
* Download the Google Analytics SDK 3.0 for [iOS](https://developers.google.com/analytics/devguides/collection/ios/) and/or [Android](https://developers.google.com/analytics/devguides/collection/android/), and install according to the Getting Started documentation
* Add a new Mobile App property through the Google Analytics Admin Console
* A Cordova 3.0+ project for iOS and/or Android

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



