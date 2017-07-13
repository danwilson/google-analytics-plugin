declare class UniversalAnalyticsPlugin {

	/** In your 'deviceready' handler, call this to set up your Analytics tracker,
		where id is your Google Analytics Mobile App property */
	public startTrackerWithId(id:String, dispatchPeriod?:Number, successCallback?:Function, errorCallback?:Function):void;

	/** Sets a UserId */
	public setUserId(id:String, successCallback?:Function, errorCallback?:Function):void;

	/** Sets a setAnonymizeIp */
	public setAnonymizeIp(anonymize:Boolean, successCallback?:Function, errorCallback?:Function):void;

    /** Sets a setOptOut */
    public setOptOut(optout:Boolean, successCallback?:Function, errorCallback?:Function): void;

	/** Sets a setAllowIDFACollection */
	public setAllowIDFACollection(enable:Boolean, successCallback?:Function, errorCallback?:Function):void;

	/** Sets a AppVersion */
	public setAppVersion(version:string, successCallback?:Function, errorCallback?:Function):void;

	/** Gets a specific variable using this key list https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters */
	public getVar(variable:string, successCallback?:Function, errorCallback?:Function):void;

	/** Sets a specific variable using this key list https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters */
	public setVar(variable:string, value:string, successCallback?:Function, errorCallback?:Function):void;

	/** To manually dispatch any data */
	public dispatch(successCallback?:Function, errorCallback?:Function);

	/** Enables verbose logging */
	public debugMode(successCallback?:Function, errorCallback?:Function):void;

	/** Track a Custom Metric */
	public trackMetric(key:number, value?:number, successCallback?:Function, errorCallback?:Function):void;

	/** Track a Screen (PageView) */
	public trackView(screen:String, campaignUrl?:string, newSession?:boolean, successCallback?:Function, errorCallback?:Function):void;

	/** Add a Custom Dimension */
	public addCustomDimension(key:number, value:String, successCallback?:Function, errorCallback?:Function):void;

	/** Track an Event */
	public trackEvent(category:String, action:String, label?:String, value?:Number, newSession?:boolean, successCallback?:Function, errorCallback?:Function):void;

	/** Track an Exception
		https://developers.google.com/analytics/devguides/collection/android/v3/exceptions */
	public trackException(description:String, fatal:Boolean, successCallback?:Function, errorCallback?:Function):void;

	/** Enable/disable automatic reporting of uncaught exceptions */
	public enableUncaughtExceptionReporting(enable:Boolean, successCallback?:Function, errorCallback?:Function):void;

	/** Track User Timing (App Speed) */
	public trackTiming(category:String, intervalInMilliseconds?:Number, name?:String, label?:String, successCallback?:Function, errorCallback?:Function):void;

	// Deprecated on 1.9.0 will be removed on next minor version (1.10.0).
	/** Add a Transaction (Google Analytics e-Ccommerce Tracking)
		https://developers.google.com/analytics/devguides/collection/analyticsjs/ecommerce */
	public addTransaction(transactionId:String, affiliation:String, revenue:Number, tax:Number, shipping:Number, currencyCode:String, successCallback?:Function, errorCallback?:Function):void;

	// Deprecated on 1.9.0 will be removed on next minor version (1.10.0).
	/** Add a Transaction Item (Ecommerce) */
	public addTransactionItem(transactionId:String, name:String, sku:String, category:String, price:Number, quantity:Number, currencyCode:String, successCallback?:Function, errorCallback?:Function):void;

}
