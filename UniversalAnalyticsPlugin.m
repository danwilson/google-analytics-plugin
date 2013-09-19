//UniversalAnalyticsPlugin.m
//Created by Daniel Wilson 2013-09-19

#import "UniversalAnalyticsPlugin.h"
#import "GAI.h"
#import "GAIDictionaryBuilder.h"
#import "GAIFields.h"

@implementation UniversalAnalyticsPlugin

- (void) startTrackerWithId: (CDVInvokedUrlCommand*)command
{
	NSString* accountId = [command.arguments objectAtIndex:0];

	[GAI sharedInstance].dispatchInterval = 10;

	[[GAI sharedInstance] trackerWithTrackingId:accountId];
}

- (void) trackEvent: (CDVInvokedUrlCommand*)command
{
	NSString* category = [command.arguments objectAtIndex:0];
	NSString* action = [command.arguments objectAtIndex:0];
	NSString* label = [command.arguments objectAtIndex:0];

	id tracker = [[GAI sharedInstance] defaultTracker];

	[tracker send:[[GAIDictionaryBuilder 
		createEventWithCtegory: category //required
		action: action //required
		label: label
		value: nil] build]];
}

- (void) trackView: (CDVInvokedUrlCommand*)command
{
	NSString* pageUri = [command.arguments objectAtIndex:0];

	id tracker = [[GAI sharedInstance] defaultTracker];
	[tracker set:kGAIScreenName value:pageUri];
	[tracker send:[[GAIDictionaryBuilder createAppView] build]];
}