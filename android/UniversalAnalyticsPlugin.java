package com.danielcwilson.plugins.analytics;

import com.google.analytics.tracking.android.Fields;
import com.google.analytics.tracking.android.GAServiceManager;
import com.google.analytics.tracking.android.GoogleAnalytics;
import com.google.analytics.tracking.android.Logger.LogLevel;
import com.google.analytics.tracking.android.MapBuilder;
import com.google.analytics.tracking.android.Tracker;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map.Entry;

public class UniversalAnalyticsPlugin extends CordovaPlugin {
    public static final String START_TRACKER = "startTrackerWithId";
    public static final String TRACK_VIEW = "trackView";
    public static final String TRACK_EVENT = "trackEvent";
    public static final String ADD_DIMENSION = "addCustomDimension";
    public static final String ADD_TRANSACTION = "addTransaction";
    public static final String ADD_TRANSACTION_ITEM = "addTransactionItem";

    public static final String SET_USER_ID = "setUserId";
    public static final String DEBUG_MODE = "debugMode";

    public Boolean trackerStarted = false;
    public Boolean debugModeEnabled = false;
    public HashMap<String, String> customDimensions = new HashMap<String, String>();

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
            int length = args.length();
            if (length > 0) {
                this.trackEvent(
                    args.getString(0),
                    length > 1 ? args.getString(1) : "",
                    length > 2 ? args.getString(2) : "",
                    length > 3 ? args.getLong(3) : 0,
                    callbackContext);
            }
            return true;
        } else if (ADD_DIMENSION.equals(action)) {
            String key = args.getString(0);
            String value = args.getString(1);
            this.addCustomDimension(key, value, callbackContext);
            return true;
        } else if (ADD_TRANSACTION.equals(action)) {
            int length = args.length();
            if (length > 0) {
                this.addTransaction(
                    args.getString(0),
                    length > 1 ? args.getString(1) : "",
                    length > 2 ? args.getDouble(2) : 0,
                    length > 3 ? args.getDouble(3) : 0,
                    length > 4 ? args.getDouble(4) : 0,
                    length > 5 ? args.getString(5) : null,
                    callbackContext);
            }
            return true;
        } else if (ADD_TRANSACTION_ITEM.equals(action)) {
            int length = args.length();
            if (length > 0) {
                this.addTransactionItem(
                    args.getString(0),
                    length > 1 ? args.getString(1) : "",
                    length > 2 ? args.getString(2) : "",
                    length > 3 ? args.getString(3) : "",
                    length > 4 ? args.getDouble(4) : 0,
                    length > 5 ? args.getLong(5) : 0,
                    length > 6 ? args.getString(6) : null,
                    callbackContext);
            }
            return true;
        } else if (SET_USER_ID.equals(action)) {
            String userId = args.getString(0);
            this.setUserId(userId, callbackContext);
        } else if (DEBUG_MODE.equals(action)) {
            this.debugMode(callbackContext);
        }
        return false;
    }

    @SuppressWarnings("deprecation")
	private void startTracker(String id, CallbackContext callbackContext) {
        if (null != id && id.length() > 0) {
            GoogleAnalytics.getInstance(this.cordova.getActivity()).getTracker(id);
            callbackContext.success("tracker started");
            trackerStarted = true;
            GAServiceManager.getInstance().setLocalDispatchPeriod(30); //deprecated but whatcha gonna do? set dispatch period to 30 sec
        } else {
            callbackContext.error("tracker id is not valid");
        }
    }

    private void addCustomDimension(String key, String value, CallbackContext callbackContext) {
        if (null != key && key.length() > 0 && null != value && value.length() > 0) {
        	customDimensions.put(key, value);
        } else {
            callbackContext.error("Expected non-empty string arguments.");
        }
    }

    private void addCustomDimensionsToTracker(Tracker tracker) {
    	for (Entry<String, String> entry : customDimensions.entrySet()) {
    		String key = entry.getKey();
    		String value = entry.getValue();
    	    //System.out.println("Setting tracker dimension slot " + key + ": <" + value+">");
    	    tracker.set(Fields.customDimension(Integer.parseInt(key)), value);
    	}
    }

    private void trackView(String screenname, CallbackContext callbackContext) {
	if (! trackerStarted ) {
            callbackContext.error("Tracker not started");
	    return;
	}

        Tracker tracker = GoogleAnalytics.getInstance(this.cordova.getActivity()).getDefaultTracker();
        addCustomDimensionsToTracker(tracker);

        if (null != screenname && screenname.length() > 0) {
            tracker.set(Fields.SCREEN_NAME, screenname);
            tracker.send(MapBuilder
              .createAppView()
              .build()
            );
            callbackContext.success("Track Screen: " + screenname);
        } else {
            callbackContext.error("Expected one non-empty string argument.");
        }
    }

    private void trackEvent(String category, String action, String label, long value, CallbackContext callbackContext) {
	if (! trackerStarted ) {
	    callbackContext.error("Tracker not started");
	    return;
	}


        Tracker tracker = GoogleAnalytics.getInstance(this.cordova.getActivity()).getDefaultTracker();
        addCustomDimensionsToTracker(tracker);

        if (null != category && category.length() > 0) {
            tracker.send(MapBuilder
                .createEvent(category, action, label, value)
                .build()
            );
            callbackContext.success("Track Event: " + category);
        } else {
            callbackContext.error("Expected non-empty string arguments.");
        }
    }

    private void addTransaction(String id, String affiliation, double revenue, double tax, double shipping, String currencyCode, CallbackContext callbackContext) {
        if (!trackerStarted) {
            callbackContext.error("Tracker not started");
            return;
        }

        Tracker tracker = GoogleAnalytics.getInstance(this.cordova.getActivity()).getDefaultTracker();
        addCustomDimensionsToTracker(tracker);

        if (null != id && id.length() > 0) {
            tracker.send(MapBuilder
                .createTransaction(id, affiliation, revenue, tax, shipping, currencyCode)
                .build()
            );
            callbackContext.success("Add Transaction: " + id);
        } else {
            callbackContext.error("Expected non-empty ID.");
        }
    }

    private void addTransactionItem(String id, String name, String sku, String category, double price, long quantity, String currencyCode, CallbackContext callbackContext) {
        if (!trackerStarted) {
            callbackContext.error("Tracker not started");
            return;
        }

        Tracker tracker = GoogleAnalytics.getInstance(this.cordova.getActivity()).getDefaultTracker();
        addCustomDimensionsToTracker(tracker);

        if (null != id && id.length() > 0) {
            tracker.send(MapBuilder
                .createItem(id, name, sku, category, price, quantity, currencyCode)
                .build()
            );
            callbackContext.success("Add Transaction Item: " + id);
        } else {
            callbackContext.error("Expected non-empty ID.");
        }
    }


    private void debugMode(CallbackContext callbackContext) {
        GoogleAnalytics.getInstance(this.cordova.getActivity()).getLogger().setLogLevel(LogLevel.VERBOSE);

        this.debugModeEnabled = true;
        callbackContext.success("debugMode enabled");
    }

    private void setUserId(String userId, CallbackContext callbackContext) {
        if (! trackerStarted ) {
            callbackContext.error("Tracker not started");
            return;
        }

        Tracker tracker = GoogleAnalytics.getInstance(this.cordova.getActivity()).getDefaultTracker();
        tracker.set("&uid", userId);
        callbackContext.success("Set user id" + userId);
    }
}

