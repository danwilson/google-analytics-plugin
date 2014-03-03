//UniversalAnalyticsPlugin.m
//Created by Daniel Wilson 2013-09-19

#import "UniversalAnalyticsPlugin.h"
#import "GAI.h"
#import "GAIDictionaryBuilder.h"
#import "GAIFields.h"

@implementation UniversalAnalyticsPlugin

- (void)pluginInitialize
{
    _trackerStarted = false;
    _customDimensions = nil;
}

- (void) startTrackerWithId: (CDVInvokedUrlCommand*)command
{
    CDVPluginResult* pluginResult = nil;
    NSString* accountId = [command.arguments objectAtIndex:0];

    [GAI sharedInstance].dispatchInterval = 10;

    [[GAI sharedInstance] trackerWithTrackingId:accountId];

    _trackerStarted = true;
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    /* NSLog(@"successfully started GAI tracker"); */
}

- (void)addCustomDimensionsToTracker: (id<GAITracker>)tracker
{
    if (_customDimensions) {
	for (NSString *key in _customDimensions) {
	    NSString *value = [_customDimensions objectForKey:key];

	    /* NSLog(@"Setting tracker dimension slot %@: <%@>", key, value); */
	    [tracker set:[GAIFields customDimensionForIndex:[key intValue]]
		   value:value];
	}
    }
}

- (void) addCustomDimension: (CDVInvokedUrlCommand*)command
{
    CDVPluginResult* pluginResult = nil;
    NSString* key = [command.arguments objectAtIndex:0];
    NSString* value = [command.arguments objectAtIndex:1];

    if ( ! _customDimensions) {
	_customDimensions = [[NSMutableDictionary alloc] init];
    }

    _customDimensions[key] = value;

    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void) trackEvent: (CDVInvokedUrlCommand*)command
{
    CDVPluginResult* pluginResult = nil;

    if ( ! _trackerStarted) {
	pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Tracker not started"];
	[self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
	return;
    }

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

    id<GAITracker> tracker = [[GAI sharedInstance] defaultTracker];

    [self addCustomDimensionsToTracker:tracker];

    [tracker send:[[GAIDictionaryBuilder 
		createEventWithCategory: category //required
				 action: action //required
				  label: label
				  value: value] build]];

    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void) trackView: (CDVInvokedUrlCommand*)command
{
    CDVPluginResult* pluginResult = nil;

    if ( ! _trackerStarted) {
	pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Tracker not started"];
	[self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
	return;
    }

    NSString* screenName = [command.arguments objectAtIndex:0];

    id<GAITracker> tracker = [[GAI sharedInstance] defaultTracker];

    [self addCustomDimensionsToTracker:tracker];


    [tracker set:kGAIScreenName value:screenName];
    [tracker send:[[GAIDictionaryBuilder createAppView] build]];

    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

@end

