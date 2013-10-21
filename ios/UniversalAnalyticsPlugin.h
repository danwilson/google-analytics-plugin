//UniversalAnalyticsPlugin.h
//Created by Daniel Wilson 2013-09-19

#import <Foundation/Foundation.h>
#import <Cordova/CDV.h>
#import "GAI.h"

@interface UniversalAnalyticsPlugin : CDVPlugin {

}

- (void) startTrackerWithId: (CDVInvokedUrlCommand*)command;
- (void) trackEvent: (CDVInvokedUrlCommand*)command;
- (void) trackView: (CDVInvokedUrlCommand*)command;

@end