//UniversalAnalyticsPlugin.m
//Created by Daniel Wilson 2013-09-19

#import "UniversalAnalyticsPlugin.h"
#import <GoogleAnalytics/GAI.h>
#import <GoogleAnalytics/GAIFields.h>
#import <GoogleAnalytics/GAIDictionaryBuilder.h>

@implementation UniversalAnalyticsPlugin

- (void) pluginInitialize
{
    _debugMode = false;
    _trackerStarted = false;
    _customDimensions = nil;
}

- (void) startTrackerWithId: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        CDVPluginResult* pluginResult = nil;
        NSString* accountId = [command.arguments objectAtIndex:0];
        NSNumber* dispatchPeriod = [command.arguments objectAtIndex:1];

        if ([dispatchPeriod isKindOfClass:[NSNumber class]])
            [GAI sharedInstance].dispatchInterval = [dispatchPeriod doubleValue];
        else
            [GAI sharedInstance].dispatchInterval = 30;

        [[GAI sharedInstance] trackerWithTrackingId:accountId];

        _trackerStarted = true;
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
    /* NSLog(@"successfully started GAI tracker"); */
}

- (void) setAllowIDFACollection: (CDVInvokedUrlCommand*) command
{
    CDVPluginResult* pluginResult = nil;
    if ( ! _trackerStarted) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Tracker not started"];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        return;
    }

    id<GAITracker> tracker = [[GAI sharedInstance] defaultTracker];
    tracker.allowIDFACollection = [[command argumentAtIndex:0 withDefault:@(NO)] boolValue];

    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void) addCustomDimensionsToTracker: (id<GAITracker>)tracker
{
    if (_customDimensions) {
      for (NSString *key in _customDimensions.allKeys) {
        NSString *value = [_customDimensions objectForKey:key];

        NSNumberFormatter *f = [[NSNumberFormatter alloc] init];
        f.numberStyle = NSNumberFormatterDecimalStyle;
        NSNumber *myKey = [f numberFromString:key];

        /* NSLog(@"Setting tracker dimension slot %@: <%@>", key, value); */
        [tracker set:[GAIFields customDimensionForIndex:myKey.unsignedIntegerValue]
        value:value];
      }
    }
}

- (void) getVar: (CDVInvokedUrlCommand*) command
{
    [self.commandDelegate runInBackground:^{
        CDVPluginResult* pluginResult = nil;
        if ( ! _trackerStarted) {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Tracker not started"];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
            return;
        }

        id<GAITracker> tracker = [[GAI sharedInstance] defaultTracker];
        NSString* parameter = [command.arguments objectAtIndex:0];
        NSString* result = [tracker get:parameter];

        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:result];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}

- (void) setVar: (CDVInvokedUrlCommand*) command
{
    [self.commandDelegate runInBackground:^{
        CDVPluginResult* pluginResult = nil;
        if ( ! _trackerStarted) {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Tracker not started"];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
            return;
        }

        id<GAITracker> tracker = [[GAI sharedInstance] defaultTracker];
        NSString* parameterName = [command.arguments objectAtIndex:0];
        NSString* parameter = [command.arguments objectAtIndex:1];
        [tracker set:parameterName value:parameter];

        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}

- (void) dispatch: (CDVInvokedUrlCommand*) command
{
  [[GAI sharedInstance] dispatch];
}

- (void) debugMode: (CDVInvokedUrlCommand*) command
{
  _debugMode = true;
  [[GAI sharedInstance].logger setLogLevel:kGAILogLevelVerbose];
}

- (void) setUserId: (CDVInvokedUrlCommand*)command
{
  CDVPluginResult* pluginResult = nil;
  NSString* userId = [command.arguments objectAtIndex:0];

  if ( ! _trackerStarted) {
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Tracker not started"];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    return;
  }

  id<GAITracker> tracker = [[GAI sharedInstance] defaultTracker];
  [tracker set:@"&uid" value: userId];

  pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void) setAnonymizeIp: (CDVInvokedUrlCommand*)command
{
  CDVPluginResult* pluginResult = nil;
  NSString* anonymize = [command.arguments objectAtIndex:0];

  if ( ! _trackerStarted) {
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Tracker not started"];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    return;
  }

  id<GAITracker> tracker = [[GAI sharedInstance] defaultTracker];
  [tracker set:kGAIAnonymizeIp value:anonymize];

  pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void) setOptOut: (CDVInvokedUrlCommand*)command
{
  CDVPluginResult* pluginResult = nil;
  bool optout = [[command.arguments objectAtIndex:0] boolValue];

  if ( ! _trackerStarted) {
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Tracker not started"];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    return;
  }

  [[GAI sharedInstance] setOptOut:optout];

  pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void) setAppVersion: (CDVInvokedUrlCommand*)command
{
  CDVPluginResult* pluginResult = nil;
  NSString* version = [command.arguments objectAtIndex:0];

  if ( ! _trackerStarted) {
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Tracker not started"];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    return;
  }

  id<GAITracker> tracker = [[GAI sharedInstance] defaultTracker];
  [tracker set:@"&av" value: version];

  pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void) enableUncaughtExceptionReporting: (CDVInvokedUrlCommand*)command
{
    CDVPluginResult* pluginResult = nil;

    if ( ! _trackerStarted) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Tracker not started"];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        return;
    }

    bool enabled = [[command.arguments objectAtIndex:0] boolValue];
    [[GAI sharedInstance] setTrackUncaughtExceptions:enabled];

    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void) addCustomDimension: (CDVInvokedUrlCommand*)command
{
    CDVPluginResult* pluginResult = nil;
    NSNumber* key = [command.arguments objectAtIndex:0];
    NSString* value = [command.arguments objectAtIndex:1];

    if ( ! _customDimensions) {
      _customDimensions = [[NSMutableDictionary alloc] init];
    }

    _customDimensions[key.stringValue] = value;

    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void) trackMetric: (CDVInvokedUrlCommand*)command
{
    CDVPluginResult* pluginResult = nil;

    if ( ! _trackerStarted) {
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Tracker not started"];
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
      return;
    }

    [self.commandDelegate runInBackground:^{
        CDVPluginResult* pluginResult = nil;
        NSNumber *key = nil;
        NSString *value = nil;

        if ([command.arguments count] > 0)
            key = [command.arguments objectAtIndex:0];

        if ([command.arguments count] > 1)
            value = [command.arguments objectAtIndex:1];

        id<GAITracker> tracker = [[GAI sharedInstance] defaultTracker];

        [tracker set:[GAIFields customMetricForIndex:[key intValue]] value:value];


        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}

- (void) trackEvent: (CDVInvokedUrlCommand*)command
{
    CDVPluginResult* pluginResult = nil;

    if ( ! _trackerStarted) {
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Tracker not started"];
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
      return;
    }

    [self.commandDelegate runInBackground:^{
        CDVPluginResult* pluginResult = nil;
        NSString *category = nil;
        NSString *action = nil;
        NSString *label = nil;
        NSNumber *value = nil;

        if ([command.arguments count] > 0)
            category = [command.arguments objectAtIndex:0];

        if ([command.arguments count] > 1)
            action = [command.arguments objectAtIndex:1];

        if ([command.arguments count] > 2)
            label = [command.arguments objectAtIndex:2];

        if ([command.arguments count] > 3)
            value = [command.arguments objectAtIndex:3];

        bool newSession = [[command argumentAtIndex:4 withDefault:@(NO)] boolValue];

        id<GAITracker> tracker = [[GAI sharedInstance] defaultTracker];

        [self addCustomDimensionsToTracker:tracker];

        GAIDictionaryBuilder *builder = [GAIDictionaryBuilder
                        createEventWithCategory: category //required
                        action: action //required
                        label: label
                        value: value];
        if(newSession){
            [builder set:@"start" forKey:kGAISessionControl];
        }
        [tracker send:[builder build]];

        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];

    }];

}

- (void) trackException: (CDVInvokedUrlCommand*)command
{
    CDVPluginResult* pluginResult = nil;

    if ( ! _trackerStarted) {
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Tracker not started"];
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
      return;
    }

    [self.commandDelegate runInBackground:^{
        CDVPluginResult* pluginResult = nil;
        NSString *description = nil;
        NSNumber *fatal = nil;

        if ([command.arguments count] > 0)
            description = [command.arguments objectAtIndex:0];

        if ([command.arguments count] > 1)
            fatal = [command.arguments objectAtIndex:1];

        id<GAITracker> tracker = [[GAI sharedInstance] defaultTracker];

        [self addCustomDimensionsToTracker:tracker];

        [tracker send:[[GAIDictionaryBuilder createScreenView] build]];

        [tracker send:[[GAIDictionaryBuilder
                        createExceptionWithDescription: description
                        withFatal: fatal] build]];

        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}

- (void) trackView: (CDVInvokedUrlCommand*)command
{
    CDVPluginResult* pluginResult = nil;

    if ( ! _trackerStarted) {
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Tracker not started"];
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
      return;
    }

    [self.commandDelegate runInBackground:^{
        CDVPluginResult* pluginResult = nil;
        NSString* screenName = [command.arguments objectAtIndex:0];

        id<GAITracker> tracker = [[GAI sharedInstance] defaultTracker];
        [self addCustomDimensionsToTracker:tracker];

        NSString* deepLinkUrl = [command.arguments objectAtIndex:1];
        GAIDictionaryBuilder* openParams = [[GAIDictionaryBuilder alloc] init];

        if (deepLinkUrl && deepLinkUrl != (NSString *)[NSNull null]) {
            [[openParams setCampaignParametersFromUrl:deepLinkUrl] build];
        }

        bool newSession = [[command argumentAtIndex:2 withDefault:@(NO)] boolValue];
        if(newSession){
            [openParams set:@"start" forKey:kGAISessionControl];
        }

        NSDictionary *hitParamsDict = [openParams build];

        [tracker set:kGAIScreenName value:screenName];
        [tracker send:[[[GAIDictionaryBuilder createScreenView] setAll:hitParamsDict] build]];

        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}

- (void) trackTiming: (CDVInvokedUrlCommand*)command
{
    CDVPluginResult* pluginResult = nil;

    if ( ! _trackerStarted) {
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Tracker not started"];
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
      return;
    }

    [self.commandDelegate runInBackground:^{
      CDVPluginResult* pluginResult = nil;

      NSString *category = nil;
      NSNumber *intervalInMilliseconds = nil;
      NSString *name = nil;
      NSString *label = nil;

      if ([command.arguments count] > 0)
          category = [command.arguments objectAtIndex:0];

      if ([command.arguments count] > 1)
          intervalInMilliseconds = [command.arguments objectAtIndex:1];

      if ([command.arguments count] > 2)
          name = [command.arguments objectAtIndex:2];

      if ([command.arguments count] > 3)
          label = [command.arguments objectAtIndex:3];

      id<GAITracker> tracker = [[GAI sharedInstance] defaultTracker];

      [self addCustomDimensionsToTracker:tracker];

      [tracker send:[[GAIDictionaryBuilder
                      createTimingWithCategory: category //required
                      interval: intervalInMilliseconds //required
                      name: name
                      label: label] build]];

      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}

- (void) addTransaction: (CDVInvokedUrlCommand*)command
{
    CDVPluginResult* pluginResult = nil;

    if ( ! _trackerStarted) {
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Tracker not started"];
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
      return;
    }

    [self.commandDelegate runInBackground:^{
      CDVPluginResult* pluginResult = nil;

      NSString *transactionId = nil;
      NSString *affiliation = nil;
      NSNumber *revenue = nil;
      NSNumber *tax = nil;
      NSNumber *shipping = nil;
      NSString *currencyCode = nil;


      if ([command.arguments count] > 0)
          transactionId = [command.arguments objectAtIndex:0];

      if ([command.arguments count] > 1)
          affiliation = [command.arguments objectAtIndex:1];

      if ([command.arguments count] > 2)
          revenue = [command.arguments objectAtIndex:2];

      if ([command.arguments count] > 3)
          tax = [command.arguments objectAtIndex:3];

      if ([command.arguments count] > 4)
          shipping = [command.arguments objectAtIndex:4];

      if ([command.arguments count] > 5)
          currencyCode = [command.arguments objectAtIndex:5];

      id<GAITracker> tracker = [[GAI sharedInstance] defaultTracker];


      [tracker send:[[GAIDictionaryBuilder createTransactionWithId:transactionId             // (NSString) Transaction ID
                                                       affiliation:affiliation         // (NSString) Affiliation
                                                           revenue:revenue                  // (NSNumber) Order revenue (including tax and shipping)
                                                               tax:tax                  // (NSNumber) Tax
                                                          shipping:shipping                      // (NSNumber) Shipping
                                                      currencyCode:currencyCode] build]];        // (NSString) Currency code


      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}



- (void) addTransactionItem: (CDVInvokedUrlCommand*)command
{
    CDVPluginResult* pluginResult = nil;

    if ( ! _trackerStarted) {
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Tracker not started"];
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
      return;
    }

    [self.commandDelegate runInBackground:^{

      CDVPluginResult* pluginResult = nil;
      NSString *transactionId = nil;
      NSString *name = nil;
      NSString *sku = nil;
      NSString *category = nil;
      NSNumber *price = nil;
      NSNumber *quantity = nil;
      NSString *currencyCode = nil;


      if ([command.arguments count] > 0)
          transactionId = [command.arguments objectAtIndex:0];

      if ([command.arguments count] > 1)
          name = [command.arguments objectAtIndex:1];

      if ([command.arguments count] > 2)
          sku = [command.arguments objectAtIndex:2];

      if ([command.arguments count] > 3)
          category = [command.arguments objectAtIndex:3];

      if ([command.arguments count] > 4)
          price = [command.arguments objectAtIndex:4];

      if ([command.arguments count] > 5)
          quantity = [command.arguments objectAtIndex:5];

      if ([command.arguments count] > 6)
          currencyCode = [command.arguments objectAtIndex:6];

      id<GAITracker> tracker = [[GAI sharedInstance] defaultTracker];


      [tracker send:[[GAIDictionaryBuilder createItemWithTransactionId:transactionId         // (NSString) Transaction ID
                                                                  name:name  // (NSString) Product Name
                                                                   sku:sku           // (NSString) Product SKU
                                                              category:category  // (NSString) Product category
                                                                 price:price               // (NSNumber)  Product price
                                                              quantity:quantity                 // (NSNumber)  Product quantity
                                                          currencyCode:currencyCode] build]];    // (NSString) Currency code


      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
      [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}

@end
