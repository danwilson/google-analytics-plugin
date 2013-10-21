package com.danielcwilson.plugins.analytics;

import com.google.analytics.tracking.android.GoogleAnalytics;
import com.google.analytics.tracking.android.Tracker;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class UniversalAnalyticsPlugin extends CordovaPlugin {
    public static final String START_TRACKER = "startTrackerWithId";
    public static final String TRACK_VIEW = "trackView";
    public static final String TRACK_EVENT = "trackEvent";

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (START_TRACKER.equals(action)) {
            String id = args.getString(0);
            this.startTracker(id, callbackContext);
            return true;
        } else if (TRACK_VIEW.equals(action)) {
            String screen = args.getString(0);
            this.trackView(screen, callbackContext);
            return true;
        } else if (TRACK_EVENT.equals(action)) {
            int length = args.length;
            if (length > 0) {
                this.trackEvent(
                    args.getString(0), 
                    length > 1 ? args.getString(1) : "", 
                    length > 2 ? args.getString(2) : "", 
                    length > 3 ? args.getInt(3) : 0, 
                    callbackContext);
            }
            return true;
        }
        return false;
    }

    private void startTracker(String id, CallbackContext callbackContext) {
        if (null != id && id.length() > 0) {
            GoogleAnalytics.getInstance(this).getTracker(id);
            callbackContext.success("tracker started");
        } else {
            callbackContext.error("tracker id is not valid");
        }
    }

    private void trackView(String screenname, CallbackContext callbackContext) {
        Tracker tracker = GoogleAnalytics.getInstance(this).getDefaultTracker();
        if (null != screenname && screenname.length() > 0) {
            tracker.set(Fields.SCREEN_NAME, screenname);
            tracker.(MapBuilder
              .createAppView()
              .build()
            );
            callbackContext.success("Track Screen: " + screenname);
        } else {
            callbackContext.error("Expected one non-empty string argument.");
        }
    }

    private void trackEvent(String category, String action, String label, int value, CallbackContext callbackContext) {
        Tracker tracker = GoogleAnalytics.getInstance(this).getDefaultTracker();
        
        if (null != category && category.length() > 0) {
            tracker.send(MapBuilder
                .createEvent(category, action, label, value);
                .build()
            );
            callbackContext.success(message);
        } else {
            callbackContext.error("Expected one non-empty string argument.");
        }
    }
}