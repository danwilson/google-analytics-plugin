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
}

- (void) trackEvent: (CDVInvokedUrlCommand*)command
{
    CDVPluginResult* pluginResult = nil;
    
    if ( ! _trackerStarted) {
	 pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Tracker not started"];
	 [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
	 return;
    }

    NSString* category = [command.arguments objectAtIndex:0];
    NSString* action = [command.arguments objectAtIndex:1];
    NSString* label = [command.arguments objectAtIndex:2];

    id tracker = [[GAI sharedInstance] defaultTracker];

    [tracker send:[[GAIDictionaryBuilder 
		createEventWithCategory: category //required
				 action: action //required
				  label: label
				  value: nil] build]];

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

    NSString* pageUri = [command.arguments objectAtIndex:0];

    id tracker = [[GAI sharedInstance] defaultTracker];
    [tracker set:kGAIScreenName value:pageUri];
    [tracker send:[[GAIDictionaryBuilder createAppView] build]];
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

@end
