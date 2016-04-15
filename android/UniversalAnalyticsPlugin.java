package com.danielcwilson.plugins.analytics;

import android.net.Uri;

import com.google.android.gms.analytics.GoogleAnalytics;
import com.google.android.gms.analytics.Logger.LogLevel;
import com.google.android.gms.analytics.HitBuilders;
import com.google.android.gms.analytics.Tracker;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map.Entry;

public class UniversalAnalyticsPlugin extends CordovaPlugin {
    public static final String START_TRACKER = "startTrackerWithId";
    public static final String TRACK_VIEW = "trackView";
    public static final String TRACK_EVENT = "trackEvent";
    public static final String TRACK_EXCEPTION = "trackException";
    public static final String TRACK_TIMING = "trackTiming";
    public static final String ADD_DIMENSION = "addCustomDimension";
    public static final String ADD_TRANSACTION = "addTransaction";
    public static final String ADD_TRANSACTION_ITEM = "addTransactionItem";
    public static final String ALLOW_IDFA_COLLECTION = "allowIDFACollection";
    public static final String SET_CAMPAIGN_DATA = "setCampaignData";
    public static final String SET_USER_ID = "setUserId";
    public static final String DEBUG_MODE = "debugMode";
    public Boolean trackerStarted = false;
    public Boolean debugModeEnabled = false;
    public HashMap<String, String> customDimensions = new HashMap<String, String>();

    public Tracker tracker;
    public String campaignData = null;

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (START_TRACKER.equals(action)) {
            String id = args.getString(0);
            this.startTracker(id, callbackContext);
            return true;
        } else if (TRACK_VIEW.equals(action)) {
            String screen = args.getString(0);
            String deepLinkUrl = args.optString(1);
            this.trackView(screen, deepLinkUrl, callbackContext);
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
        } else if (TRACK_EXCEPTION.equals(action)) {
            String description = args.getString(0);
            Boolean fatal = args.getBoolean(1);
            this.trackException(description, fatal, callbackContext);
            return true;
        } else if (TRACK_TIMING.equals(action)) {
            int length = args.length();
            if (length > 0) {
                this.trackTiming(args.getString(0), length > 1 ? args.getLong(1) : 0, length > 2 ? args.getString(2) : "", length > 3 ? args.getString(3) : "", callbackContext);
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
        } else if (ALLOW_IDFA_COLLECTION.equals(action)) {
            this.allowIdfaCollection(callbackContext);
            return true;
        } else if (SET_CAMPAIGN_DATA.equals(action)) {
            this.setCampaignData(args.getJSONObject(0), callbackContext);
            return true;
        }
        return false;
    }

    private void _setCampaignParamsOnNextHit() {
        if (tracker != null) {
            if (campaignData != null && campaignData.length() > 0) {
                tracker.setCampaignParamsOnNextHit(Uri.parse(campaignData));
            }
        }
    }

    private void setCampaignData(JSONObject options, CallbackContext callbackContext) throws JSONException {
        ArrayList<String> queryParams = new ArrayList<String>();

        if (options.has("utm_id")) {
            queryParams.add("utm_id%3D" + options.getString("utm_id")); //%3D is url-encoded =
        }
        if (options.has("utm_campaign")) {
            queryParams.add("utm_campaign%3D" + options.getString("utm_campaign")); //%3D is url-encoded =
        }
        if (options.has("utm_content")) {
            queryParams.add("utm_content%3D" + options.getString("utm_content")); //%3D is url-encoded =
        }
        if (options.has("utm_medium")) {
            queryParams.add("utm_medium%3D" + options.getString("utm_medium")); //%3D is url-encoded =
        }
        if (options.has("utm_source")) {
            queryParams.add("utm_source%3D" + options.getString("utm_source")); //%3D is url-encoded =
        }
        if (options.has("utm_term")) {
            queryParams.add("utm_term%3D" + options.getString("utm_term")); //%3D is url-encoded =
        }

        StringBuilder uri = new StringBuilder();
        uri.append("http://www.hurdlr.com/campaign/"); // an arbitrary url we'll pass into Google's helper method.
        if (queryParams.size() > 0) {
            uri.append("?referrer=");
            for (String param : queryParams) {
                uri.append(param + "%26"); //%26 is "&"
            }
            campaignData = uri.toString();
        } else {
            campaignData = null;
        }

        callbackContext.success("Saved campaign data");
    }

    private void allowIdfaCollection(CallbackContext callbackContext) {
        if (tracker != null) {
            tracker.enableAdvertisingIdCollection(true);
            callbackContext.success("IDFA tracking enabled");
        } else {
            callbackContext.error("IDFA couldn't be turned on since the tracker is null.");
        }
    }

    private void startTracker(String id, CallbackContext callbackContext) {
        if (null != id && id.length() > 0) {
            tracker = GoogleAnalytics.getInstance(this.cordova.getActivity()).newTracker(id);
            callbackContext.success("tracker started");
            trackerStarted = true;
            GoogleAnalytics.getInstance(this.cordova.getActivity()).setLocalDispatchPeriod(30);
        } else {
            callbackContext.error("tracker id is not valid");
        }
    }

    private void addCustomDimension(String key, String value, CallbackContext callbackContext) {
        if (null != key && key.length() > 0 && null != value && value.length() > 0) {
            customDimensions.put(key, value);
            callbackContext.success("custom dimension started");
        } else {
            callbackContext.error("Expected non-empty string arguments.");
        }
    }

    private void addCustomDimensionsToTracker(Tracker tracker) {
        for (Entry<String, String> entry : customDimensions.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            //System.out.println("Setting tracker dimension slot " + key + ": <" + value+">");
            tracker.send(new HitBuilders
                    .AppViewBuilder()
                    .setCustomDimension((Integer.parseInt(key)), value).build());
        }
    }

    private void trackView(String screenname, String deepLinkUrl, CallbackContext callbackContext) {
        if (! trackerStarted ) {
            callbackContext.error("Tracker not started");
            return;
        }

        addCustomDimensionsToTracker(tracker);

        if (null != screenname && screenname.length() > 0) {
            _setCampaignParamsOnNextHit();
            tracker.setScreenName(screenname);
            tracker.send(new HitBuilders
                    .ScreenViewBuilder()
                    .setCampaignParamsFromUrl(deepLinkUrl)
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

        addCustomDimensionsToTracker(tracker);

        if (null != category && category.length() > 0) {
            _setCampaignParamsOnNextHit();
            tracker.send(new HitBuilders
                    .EventBuilder()
                    .setCategory(category)
                    .setAction(action)
                    .setLabel(label)
                    .setValue(value)
                    .build()
                    );
            callbackContext.success("Track Event: " + category);
        } else {
            callbackContext.error("Expected non-empty string arguments.");
        }
    }

    private void trackException(String description, Boolean fatal, CallbackContext callbackContext) {
        if (! trackerStarted ) {
            callbackContext.error("Tracker not started");
            return;
        }

        addCustomDimensionsToTracker(tracker);

        if (null != description && description.length() > 0) {
            _setCampaignParamsOnNextHit();
            tracker.send(new HitBuilders
                    .ExceptionBuilder()
                    .setDescription(description)
                    .setFatal(fatal)
                    .build()
                    );
            callbackContext.success("Track Exception: " + description);
        } else {
            callbackContext.error("Expected non-empty string arguments.");
        }
    }

    private void trackTiming(String category, long intervalInMilliseconds, String name, String label, CallbackContext callbackContext) {
        if (!trackerStarted) {
            callbackContext.error("Tracker not started");
            return;
        }

        addCustomDimensionsToTracker(tracker);

        if (null != category && category.length() > 0) {
            _setCampaignParamsOnNextHit();
            tracker.send(new HitBuilders
                    .TimingBuilder()
                    .setCategory(category)
                    .setValue(intervalInMilliseconds)
                    .setVariable(name)
                    .setLabel(label)
                    .build()
                    );
            callbackContext.success("Track Timing: " + category);
        } else {
            callbackContext.error("Expected non-empty string arguments.");
        }
    }

    private void addTransaction(String id, String affiliation, double revenue, double tax, double shipping, String currencyCode, CallbackContext callbackContext) {
        if (!trackerStarted) {
            callbackContext.error("Tracker not started");
            return;
        }

        addCustomDimensionsToTracker(tracker);

        if (null != id && id.length() > 0) {
            _setCampaignParamsOnNextHit();
            tracker.send(new HitBuilders
                    .TransactionBuilder()
                    .setTransactionId(id)
                    .setAffiliation(affiliation)
                    .setRevenue(revenue).setTax(tax)
                    .setShipping(shipping)
                    .setCurrencyCode(currencyCode)
                    .build()
                    ); //Deprecated
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

        addCustomDimensionsToTracker(tracker);

        if (null != id && id.length() > 0) {
            _setCampaignParamsOnNextHit();
            tracker.send(new HitBuilders
                    .ItemBuilder()
                    .setTransactionId(id)
                    .setName(name)
                    .setSku(sku)
                    .setCategory(category)
                    .setPrice(price)
                    .setQuantity(quantity)
                    .setCurrencyCode(currencyCode)
                    .build()
                    ); //Deprecated
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

        tracker.set("&uid", userId);
        callbackContext.success("Set user id" + userId);
    }
}