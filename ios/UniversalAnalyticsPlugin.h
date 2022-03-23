/*
 *   Copyright (c) 2020 PeopleWare S.R.L.

 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.

 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.

 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

//UniversalAnalyticsPlugin.h
//Created by Daniel Wilson 2013-09-19

#import <Foundation/Foundation.h>
#import <Cordova/CDV.h>
#import <GoogleAnalytics/GAI.h>
#import <GoogleAnalytics/GAIFields.h>
#import <GoogleAnalytics/GAIDictionaryBuilder.h>

@interface UniversalAnalyticsPlugin : CDVPlugin {
    bool _trackerStarted;
    bool _debugMode;
	NSMutableDictionary *_customDimensions;
}

- (void) startTrackerWithId: (CDVInvokedUrlCommand*)command;
- (void) setAllowIDFACollection: (CDVInvokedUrlCommand*) command;
- (void) setUserId: (CDVInvokedUrlCommand*)command;
- (void) setAppVersion: (CDVInvokedUrlCommand*)command;
- (void) getVar: (CDVInvokedUrlCommand*)command;
- (void) setVar: (CDVInvokedUrlCommand*)command;
- (void) dispatch: (CDVInvokedUrlCommand*)command;
- (void) debugMode: (CDVInvokedUrlCommand*)command;
- (void) setOptOut: (CDVInvokedUrlCommand*)command;
- (void) enableUncaughtExceptionReporting: (CDVInvokedUrlCommand*)command;
- (void) addCustomDimension: (CDVInvokedUrlCommand*)command;
- (void) trackEvent: (CDVInvokedUrlCommand*)command;
- (void) trackMetric: (CDVInvokedUrlCommand*)command;
- (void) trackTiming: (CDVInvokedUrlCommand*)command;
- (void) trackView: (CDVInvokedUrlCommand*)command;
- (void) trackException: (CDVInvokedUrlCommand*)command;
- (void) addTransaction: (CDVInvokedUrlCommand*)command;
- (void) addTransactionItem: (CDVInvokedUrlCommand*)command;

@end

