package myapp.fxman77.billing;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.NonNull;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * GooglePlayBillingPlugin - Capacitor Native Plugin for Google Play Billing Library 9.1.0
 * Handles subscriptions (Product ID: calculator_pro with base plans monthly and yearly).
 */
@CapacitorPlugin(name = "GooglePlayBilling")
public class GooglePlayBillingPlugin extends Plugin implements PurchasesUpdatedListener, BillingClientStateListener {

    private static final String TAG = "GooglePlayBilling";
    private static final String DEFAULT_PRODUCT_ID = "calculator_pro";

    private BillingClient billingClient;
    private boolean isConnected = false;
    private final Map<String, ProductDetails> productDetailsCache = new HashMap<>();
    private PluginCall activePurchaseCall = null;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    @Override
    public void load() {
        super.load();
        initBillingClient();
    }

    private synchronized void initBillingClient() {
        if (billingClient == null) {
            PendingPurchasesParams pendingPurchasesParams = PendingPurchasesParams.newBuilder()
                    .enableOneTimeProducts()
                    .enablePrepaidPlans()
                    .build();

            billingClient = BillingClient.newBuilder(getContext())
                    .setListener(this)
                    .enablePendingPurchases(pendingPurchasesParams)
                    .build();
        }
    }

    /**
     * Initialize connection with Google Play Store service.
     */
    @PluginMethod
    public void initialize(PluginCall call) {
        initBillingClient();

        if (isConnected && billingClient != null && billingClient.isReady()) {
            JSObject ret = new JSObject();
            ret.put("connected", true);
            call.resolve(ret);
            return;
        }

        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(@NonNull BillingResult billingResult) {
                int responseCode = billingResult.getResponseCode();
                if (responseCode == BillingClient.BillingResponseCode.OK) {
                    isConnected = true;
                    Log.i(TAG, "Billing service connected successfully");
                    JSObject ret = new JSObject();
                    ret.put("connected", true);
                    call.resolve(ret);
                } else {
                    isConnected = false;
                    Log.w(TAG, "Billing setup failed with response code: " + responseCode + " - " + billingResult.getDebugMessage());
                    call.reject("Billing setup failed: " + billingResult.getDebugMessage(), String.valueOf(responseCode));
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                isConnected = false;
                Log.w(TAG, "Billing service disconnected");
            }
        });
    }

    @Override
    public void onBillingSetupFinished(@NonNull BillingResult billingResult) {
        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
            isConnected = true;
            Log.i(TAG, "Billing service setup finished successfully");
        } else {
            isConnected = false;
            Log.w(TAG, "Billing setup failed: " + billingResult.getDebugMessage());
        }
    }

    @Override
    public void onBillingServiceDisconnected() {
        isConnected = false;
        Log.w(TAG, "Billing service disconnected. Will reconnect on next request.");
    }

    /**
     * Query subscription details (localized pricing, base plans: monthly, yearly)
     */
    @PluginMethod
    public void queryProductDetails(PluginCall call) {
        if (!isReady(call)) return;

        String productId = call.getString("productId", DEFAULT_PRODUCT_ID);

        List<QueryProductDetailsParams.Product> productList = new ArrayList<>();
        productList.add(
                QueryProductDetailsParams.Product.newBuilder()
                        .setProductId(productId)
                        .setProductType(BillingClient.ProductType.SUBS)
                        .build()
        );

        QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
                .setProductList(productList)
                .build();

        billingClient.queryProductDetailsAsync(params, (billingResult, queryProductDetailsResult) -> {
            int code = billingResult.getResponseCode();
            if (code != BillingClient.BillingResponseCode.OK) {
                call.reject("Failed to query product details: " + billingResult.getDebugMessage(), String.valueOf(code));
                return;
            }

            List<ProductDetails> productDetailsList = queryProductDetailsResult != null
                    ? queryProductDetailsResult.getProductDetailsList()
                    : null;

            if (productDetailsList == null || productDetailsList.isEmpty()) {
                JSObject ret = new JSObject();
                ret.put("found", false);
                ret.put("productId", productId);
                ret.put("message", "Product not found on Google Play Console");
                call.resolve(ret);
                return;
            }

            JSArray productsArray = new JSArray();
            JSObject plansObject = new JSObject();

            for (ProductDetails pd : productDetailsList) {
                productDetailsCache.put(pd.getProductId(), pd);

                JSObject prodObj = new JSObject();
                prodObj.put("productId", pd.getProductId());
                prodObj.put("title", pd.getTitle());
                prodObj.put("description", pd.getDescription());
                prodObj.put("productType", pd.getProductType());

                JSArray offersArray = new JSArray();
                List<ProductDetails.SubscriptionOfferDetails> offerDetailsList = pd.getSubscriptionOfferDetails();

                if (offerDetailsList != null) {
                    for (ProductDetails.SubscriptionOfferDetails offer : offerDetailsList) {
                        JSObject offerObj = new JSObject();
                        String basePlanId = offer.getBasePlanId();
                        String offerToken = offer.getOfferToken();

                        offerObj.put("basePlanId", basePlanId);
                        offerObj.put("offerId", offer.getOfferId());
                        offerObj.put("offerToken", offerToken);

                        List<ProductDetails.PricingPhase> phases = offer.getPricingPhases().getPricingPhaseList();
                        if (phases != null && !phases.isEmpty()) {
                            ProductDetails.PricingPhase firstPhase = phases.get(0);
                            offerObj.put("formattedPrice", firstPhase.getFormattedPrice());
                            offerObj.put("priceCurrencyCode", firstPhase.getPriceCurrencyCode());
                            offerObj.put("priceAmountMicros", firstPhase.getPriceAmountMicros());
                            offerObj.put("billingPeriod", firstPhase.getBillingPeriod());

                            // Map directly by basePlanId (e.g. monthly, yearly)
                            JSObject planSummary = new JSObject();
                            planSummary.put("basePlanId", basePlanId);
                            planSummary.put("offerToken", offerToken);
                            planSummary.put("formattedPrice", firstPhase.getFormattedPrice());
                            planSummary.put("currencyCode", firstPhase.getPriceCurrencyCode());
                            planSummary.put("amountMicros", firstPhase.getPriceAmountMicros());
                            planSummary.put("billingPeriod", firstPhase.getBillingPeriod());

                            plansObject.put(basePlanId, planSummary);
                        }

                        offersArray.put(offerObj);
                    }
                }

                prodObj.put("offers", offersArray);
                productsArray.put(prodObj);
            }

            JSObject response = new JSObject();
            response.put("found", true);
            response.put("products", productsArray);
            response.put("plans", plansObject);
            call.resolve(response);
        });
    }

    /**
     * Launch Google Play Billing bottom sheet for selected subscription plan.
     */
    @PluginMethod
    public void launchBillingFlow(PluginCall call) {
        if (!isReady(call)) return;

        String productId = call.getString("productId", DEFAULT_PRODUCT_ID);
        String basePlanId = call.getString("basePlanId");
        String offerToken = call.getString("offerToken");

        ProductDetails productDetails = productDetailsCache.get(productId);
        if (productDetails == null) {
            call.reject("Product details not cached. Call queryProductDetails first.", "PRODUCT_NOT_CACHED");
            return;
        }

        // If offerToken not provided directly, find matching offerToken by basePlanId
        if ((offerToken == null || offerToken.isEmpty()) && basePlanId != null) {
            List<ProductDetails.SubscriptionOfferDetails> offers = productDetails.getSubscriptionOfferDetails();
            if (offers != null) {
                for (ProductDetails.SubscriptionOfferDetails offer : offers) {
                    if (basePlanId.equalsIgnoreCase(offer.getBasePlanId())) {
                        offerToken = offer.getOfferToken();
                        break;
                    }
                }
            }
        }

        if (offerToken == null || offerToken.isEmpty()) {
            call.reject("Valid offerToken or basePlanId (monthly/yearly) required", "INVALID_PLAN");
            return;
        }

        List<BillingFlowParams.ProductDetailsParams> productDetailsParamsList = new ArrayList<>();
        productDetailsParamsList.add(
                BillingFlowParams.ProductDetailsParams.newBuilder()
                        .setProductDetails(productDetails)
                        .setOfferToken(offerToken)
                        .build()
        );

        BillingFlowParams billingFlowParams = BillingFlowParams.newBuilder()
                .setProductDetailsParamsList(productDetailsParamsList)
                .build();

        this.activePurchaseCall = call;

        mainHandler.post(() -> {
            try {
                BillingResult result = billingClient.launchBillingFlow(getActivity(), billingFlowParams);
                if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    if (activePurchaseCall != null) {
                        activePurchaseCall.reject("Failed to launch billing flow: " + result.getDebugMessage(), String.valueOf(result.getResponseCode()));
                        activePurchaseCall = null;
                    }
                }
            } catch (Exception e) {
                if (activePurchaseCall != null) {
                    activePurchaseCall.reject("Exception launching billing: " + e.getMessage(), e);
                    activePurchaseCall = null;
                }
            }
        });
    }

    /**
     * PurchasesUpdatedListener callback
     */
    @Override
    public void onPurchasesUpdated(@NonNull BillingResult billingResult, List<Purchase> purchases) {
        int code = billingResult.getResponseCode();

        if (code == BillingClient.BillingResponseCode.OK && purchases != null) {
            for (Purchase purchase : purchases) {
                handlePurchase(purchase);
            }
        } else if (code == BillingClient.BillingResponseCode.USER_CANCELED) {
            Log.i(TAG, "User canceled billing flow");
            if (activePurchaseCall != null) {
                JSObject ret = new JSObject();
                ret.put("success", false);
                ret.put("canceled", true);
                ret.put("message", "User canceled purchase");
                activePurchaseCall.resolve(ret);
                activePurchaseCall = null;
            }
            notifyListeners("onPurchaseCanceled", new JSObject());
        } else {
            Log.w(TAG, "Purchase failed with code: " + code + " - " + billingResult.getDebugMessage());
            if (activePurchaseCall != null) {
                activePurchaseCall.reject("Purchase failed: " + billingResult.getDebugMessage(), String.valueOf(code));
                activePurchaseCall = null;
            }
            JSObject errObj = new JSObject();
            errObj.put("code", code);
            errObj.put("message", billingResult.getDebugMessage());
            notifyListeners("onPurchaseFailed", errObj);
        }
    }

    private void handlePurchase(Purchase purchase) {
        JSObject purchaseData = parsePurchase(purchase);

        if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
            // Strictly valid completed purchase
            purchaseData.put("success", true);
            purchaseData.put("pending", false);

            if (activePurchaseCall != null) {
                activePurchaseCall.resolve(purchaseData);
                activePurchaseCall = null;
            }

            notifyListeners("onPurchaseSuccess", purchaseData);

        } else if (purchase.getPurchaseState() == Purchase.PurchaseState.PENDING) {
            // Pending purchase - DO NOT GRANT PRO YET
            Log.i(TAG, "Purchase is in PENDING state. Pro entitlement withheld until settlement.");
            purchaseData.put("success", false);
            purchaseData.put("pending", true);
            purchaseData.put("message", "Payment is pending settlement");

            if (activePurchaseCall != null) {
                activePurchaseCall.resolve(purchaseData);
                activePurchaseCall = null;
            }

            notifyListeners("onPurchasePending", purchaseData);
        }
    }

    /**
     * Acknowledge purchased subscription with Google Play.
     */
    @PluginMethod
    public void acknowledgePurchase(PluginCall call) {
        if (!isReady(call)) return;

        String purchaseToken = call.getString("purchaseToken");
        if (purchaseToken == null || purchaseToken.isEmpty()) {
            call.reject("purchaseToken is required");
            return;
        }

        AcknowledgePurchaseParams params = AcknowledgePurchaseParams.newBuilder()
                .setPurchaseToken(purchaseToken)
                .build();

        billingClient.acknowledgePurchase(params, billingResult -> {
            int code = billingResult.getResponseCode();
            if (code == BillingClient.BillingResponseCode.OK) {
                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("acknowledged", true);
                call.resolve(ret);
            } else {
                call.reject("Acknowledge failed: " + billingResult.getDebugMessage(), String.valueOf(code));
            }
        });
    }

    /**
     * Query currently active subscriptions directly from Google Play cache.
     * Used for startup verification and Restore Purchases flow.
     */
    @PluginMethod
    public void queryActivePurchases(PluginCall call) {
        if (!isReady(call)) return;

        QueryPurchasesParams params = QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.SUBS)
                .build();

        billingClient.queryPurchasesAsync(params, (billingResult, purchases) -> {
            int code = billingResult.getResponseCode();
            if (code != BillingClient.BillingResponseCode.OK) {
                call.reject("Failed to query active purchases: " + billingResult.getDebugMessage(), String.valueOf(code));
                return;
            }

            JSArray activePurchasesArray = new JSArray();
            boolean hasActiveSubscription = false;

            if (purchases != null) {
                for (Purchase p : purchases) {
                    // Only count PURCHASED state (not PENDING or UNSPECIFIED)
                    if (p.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                        hasActiveSubscription = true;
                        activePurchasesArray.put(parsePurchase(p));
                    }
                }
            }

            JSObject ret = new JSObject();
            ret.put("hasActiveSubscription", hasActiveSubscription);
            ret.put("purchases", activePurchasesArray);
            call.resolve(ret);
        });
    }

    private JSObject parsePurchase(Purchase purchase) {
        JSObject obj = new JSObject();
        obj.put("orderId", purchase.getOrderId());
        obj.put("purchaseToken", purchase.getPurchaseToken());
        obj.put("purchaseTime", purchase.getPurchaseTime());
        obj.put("purchaseState", purchase.getPurchaseState());
        obj.put("isAcknowledged", purchase.isAcknowledged());
        obj.put("isAutoRenewing", purchase.isAutoRenewing());
        obj.put("originalJson", purchase.getOriginalJson());
        obj.put("signature", purchase.getSignature());

        JSArray prods = new JSArray();
        for (String p : purchase.getProducts()) {
            prods.put(p);
        }
        obj.put("products", prods);

        return obj;
    }

    private boolean isReady(PluginCall call) {
        if (billingClient == null || !billingClient.isReady()) {
            call.reject("Google Play BillingClient is not connected. Call initialize() first.", "NOT_CONNECTED");
            return false;
        }
        return true;
    }

    @Override
    protected void handleOnDestroy() {
        if (billingClient != null && billingClient.isReady()) {
            billingClient.endConnection();
            billingClient = null;
        }
        super.handleOnDestroy();
    }
}
