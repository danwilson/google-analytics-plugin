export interface Product {
	id: string;
	name: string;
	category?: string;
	brand?: string;
	variant?: string;
	position?: number;
	customDimension?: any[];
	customMetric?: any[];
	price?: number;
	quantity?: number;
	couponCode?: string;
}

export type ProductActionType = "ACTION_ADD" |
						 "ACTION_CHECKOUT" |
						 "ACTION_CHECKOUT_OPTION" |
						 "ACTION_CHECKOUT_OPTIONS" |
						 "ACTION_CLICK" |
						 "ACTION_DETAIL" |
						 "ACTION_PURCHASE" |
						 "ACTION_REFUND" |
						 "ACTION_REMOVE"

export interface ProductAction {
	action: ProductActionType;
	transactionId?: string;
	transactionRevenue?: number;
	transactionCouponCode?: string;
	transactionShipping?: number;
	transactionTax?: number;
	checkoutOptions?: string;
	checkoutStep?: number;
	transactionAffiliation?: string;
}

export interface Promotion {
	id: string;
	name: string;
	position?: string;
	creative?: string;
}

export type PromotionAction = "ACTION_CLICK" |
					   "ACTION_VIEW"

declare class UniversalAnalyticsPlugin {

	/** In your 'deviceready' handler, call this to set up your Analytics tracker,
		where id is your Google Analytics Mobile App property */
	public startTrackerWithId(id:string, dispatchPeriod?:number, successCallback?:Function, errorCallback?:Function):void;

	/** Sets a UserId */
	public setUserId(id:string, successCallback?:Function, errorCallback?:Function):void;

	/** Sets a setAnonymizeIp */
	public setAnonymizeIp(anonymize:boolean, successCallback?:Function, errorCallback?:Function):void;

    /** Sets a setOptOut */
    public setOptOut(optout:boolean, successCallback?:Function, errorCallback?:Function): void;

	/** Sets a setAllowIDFACollection */
	public setAllowIDFACollection(enable:boolean, successCallback?:Function, errorCallback?:Function):void;

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
	public trackView(screen:string, campaignUrl?:string, newSession?:boolean, successCallback?:Function, errorCallback?:Function):void;

	/** Add a Custom Dimension */
	public addCustomDimension(key:number, value:string, successCallback?:Function, errorCallback?:Function):void;

	/** Track an Event */
	public trackEvent(category:string, action:string, label?:string, value?:number, newSession?:boolean, successCallback?:Function, errorCallback?:Function):void;

	/** Track an Exception
		https://developers.google.com/analytics/devguides/collection/android/v3/exceptions */
	public trackException(description:string, fatal:boolean, successCallback?:Function, errorCallback?:Function):void;

	/** Enable/disable automatic reporting of uncaught exceptions */
	public enableUncaughtExceptionReporting(enable:boolean, successCallback?:Function, errorCallback?:Function):void;

	/** Track User Timing (App Speed) */
	public trackTiming(category:string, intervalInMilliseconds?:number, name?:string, label?:string, successCallback?:Function, errorCallback?:Function):void;

	// Deprecated on 1.9.0 will be removed on next minor version (1.10.0).
	/** Add a Transaction (Google Analytics e-Ccommerce Tracking)
		https://developers.google.com/analytics/devguides/collection/analyticsjs/ecommerce */
	public addTransaction(transactionId:string, affiliation:string, revenue:number, tax:number, shipping:number, currencyCode:string, successCallback?:Function, errorCallback?:Function):void;

	// Deprecated on 1.9.0 will be removed on next minor version (1.10.0).
	/** Add a Transaction Item (Ecommerce) */
	public addTransactionItem(transactionId:string, name:string, sku:string, category:string, price:number, quantity:number, currencyCode:string, successCallback?:Function, errorCallback?:Function):void;

	public addImpression(screen:string, product:Product, successCallback?:Function, errorCallback?:Function):void;

	public productAction(screen:string, product:Product, productAction: ProductAction, successCallback?:Function, errorCallback?:Function):void;

	public addPromotion(action:PromotionAction, promotion:Promotion, category:string, label?:string, successCallback?:Function, errorCallback?:Function):void;

}
