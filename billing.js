/**
 * billing.js - Google Play Billing Library 9.1.0 Client Module
 * Calculator & Converter (myapp.fxman77)
 * 
 * Manages Google Play Subscriptions (Product ID: calculator_pro)
 * Base Plans:
 *   - monthly ($1.49 / month)
 *   - yearly ($9.99 / year)
 * 
 * Strict Entitlement Rules:
 *   - Native Google Play cache (queryPurchasesAsync) is the sole source of truth.
 *   - PENDING purchases do NOT unlock PRO features until settlement.
 *   - Restoring purchases requires verified Google Play PURCHASED state.
 *   - Grace periods / active billing cycles are honored until official expiry.
 */
(function(window) {
    'use strict';

    const CONFIG = {
        productId: 'calculator_pro',
        basePlans: {
            monthly: 'monthly',
            yearly: 'yearly'
        },
        fallbackPrices: {
            monthly: '$1.49',
            yearly: '$9.99'
        }
    };

    let isNative = false;
    let isBillingReady = false;
    let isProActive = false; // In-memory verified entitlement truth
    let cachedProductDetails = null;
    let cachedPlans = {};
    let selectedPlanId = 'yearly'; // Pre-selected best-value plan
    const stateChangeListeners = [];

    // Helper: Safely verify Capacitor native platform
    function checkIsNative() {
        return !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());
    }

    // Helper: Retrieve registered GooglePlayBilling Capacitor plugin
    function getBillingPlugin() {
        if (!checkIsNative()) return null;
        return (window.Capacitor.Plugins && window.Capacitor.Plugins.GooglePlayBilling)
            ? window.Capacitor.Plugins.GooglePlayBilling
            : null;
    }

    // Notify registered listeners and synchronise UI cache
    function setProState(newState) {
        const changed = (isProActive !== !!newState);
        isProActive = !!newState;

        // Maintain localStorage strictly as temporary UI cache for offline render
        try {
            localStorage.setItem('isUserPro', isProActive ? 'true' : 'false');
        } catch (e) {
            // Ignore storage quota errors
        }

        // Notify AdMob controller immediately
        if (window.AdMobController) {
            if (isProActive) {
                window.AdMobController.onProActivated();
            } else {
                window.AdMobController.onProDeactivated();
            }
        }

        // Fire registered state listeners
        stateChangeListeners.forEach(fn => {
            try {
                fn(isProActive);
            } catch (err) {
                console.warn('[Billing] State listener error:', err);
            }
        });

        console.log('[Billing] Entitlement status updated. isProActive =', isProActive);
    }

    const BillingController = {
        CONFIG,

        // Initialize connection with Google Play Billing 9.1.0
        async init() {
            isNative = checkIsNative();
            if (!isNative) {
                console.log('[Billing] Web / browser environment detected. Billing disabled.');
                setProState(false);
                return;
            }

            const plugin = getBillingPlugin();
            if (!plugin) {
                console.warn('[Billing] Native GooglePlayBilling plugin not found.');
                setProState(false);
                return;
            }

            try {
                // 1. Establish connection to Google Play Store client
                const initRes = await plugin.initialize();
                if (initRes && initRes.connected) {
                    isBillingReady = true;
                    console.log('[Billing] Google Play Billing service connected.');
                }

                // 2. Setup push event listeners
                this.setupEventListeners(plugin);

                // 3. Query product details (fetch localized pricing)
                await this.fetchProductDetails();

                // 4. Query active subscriptions (startup sync / auto-restore)
                await this.checkActivePurchases();

            } catch (err) {
                console.warn('[Billing] Initialization failed:', err);
                // On error, NEVER assume or grant PRO!
                setProState(false);
            }
        },

        // Setup real-time event listeners from native layer
        setupEventListeners(plugin) {
            if (!plugin || typeof plugin.addListener !== 'function') return;

            plugin.addListener('onPurchaseSuccess', async (purchaseData) => {
                console.log('[Billing] Received onPurchaseSuccess event:', purchaseData);
                if (purchaseData && purchaseData.purchaseToken) {
                    if (!purchaseData.isAcknowledged) {
                        await this.acknowledge(purchaseData.purchaseToken);
                    }
                    setProState(true);
                }
            });

            plugin.addListener('onPurchasePending', (purchaseData) => {
                console.log('[Billing] Received onPurchasePending event:', purchaseData);
                // Strict: PENDING purchases withholding PRO until settlement
                setProState(false);
            });

            plugin.addListener('onPurchaseCanceled', () => {
                console.log('[Billing] Purchase canceled by user.');
            });

            plugin.addListener('onPurchaseFailed', (err) => {
                console.warn('[Billing] Purchase failed event:', err);
            });
        },

        // Fetch dynamic localized pricing from Google Play Console
        async fetchProductDetails() {
            const plugin = getBillingPlugin();
            if (!plugin || !isBillingReady) return null;

            try {
                const res = await plugin.queryProductDetails({ productId: CONFIG.productId });
                console.log('[Billing] Product details received:', res);

                if (res && res.found) {
                    cachedProductDetails = res;
                    if (res.plans) {
                        cachedPlans = res.plans;
                        this.updateUiPrices();
                    }
                }
                return res;
            } catch (err) {
                console.warn('[Billing] queryProductDetails failed:', err);
                return null;
            }
        },

        // Update UI price tags in the PRO modal
        updateUiPrices() {
            const monthlyEl = document.getElementById('proPriceMonthly');
            const yearlyEl = document.getElementById('proPriceYearly');

            if (monthlyEl) {
                if (cachedPlans.monthly && cachedPlans.monthly.formattedPrice) {
                    monthlyEl.textContent = cachedPlans.monthly.formattedPrice;
                } else {
                    monthlyEl.textContent = CONFIG.fallbackPrices.monthly;
                }
            }

            if (yearlyEl) {
                if (cachedPlans.yearly && cachedPlans.yearly.formattedPrice) {
                    yearlyEl.textContent = cachedPlans.yearly.formattedPrice;
                } else {
                    yearlyEl.textContent = CONFIG.fallbackPrices.yearly;
                }
            }
        },

        // Query active purchases from Google Play on-device cache
        async checkActivePurchases() {
            const plugin = getBillingPlugin();
            if (!plugin || !isBillingReady) {
                setProState(false);
                return false;
            }

            try {
                const res = await plugin.queryActivePurchases();
                console.log('[Billing] Active purchases query result:', res);

                if (res && res.hasActiveSubscription && Array.isArray(res.purchases) && res.purchases.length > 0) {
                    // PurchaseState: 1 = PURCHASED, 2 = PENDING
                    const validPurchase = res.purchases.find(p => p.purchaseState === 1);
                    if (validPurchase) {
                        if (!validPurchase.isAcknowledged && validPurchase.purchaseToken) {
                            await this.acknowledge(validPurchase.purchaseToken);
                        }
                        setProState(true);
                        return true;
                    }
                }

                // If no active valid subscription is returned by Google Play
                setProState(false);
                return false;
            } catch (err) {
                console.warn('[Billing] checkActivePurchases failed:', err);
                setProState(false);
                return false;
            }
        },

        // Acknowledge subscription with Google Play
        async acknowledge(purchaseToken) {
            const plugin = getBillingPlugin();
            if (!plugin || !purchaseToken) return false;

            try {
                const res = await plugin.acknowledgePurchase({ purchaseToken });
                console.log('[Billing] Acknowledge response:', res);
                return res && res.success;
            } catch (err) {
                console.warn('[Billing] acknowledgePurchase failed:', err);
                return false;
            }
        },

        // Initiate purchase flow for chosen plan
        async purchase(basePlanId) {
            const planToBuy = basePlanId || selectedPlanId || 'yearly';
            const plugin = getBillingPlugin();

            if (!checkIsNative() || !plugin) {
                return {
                    success: false,
                    error: 'NOT_NATIVE',
                    message: "Google Play Billing xizmati faqat Android qurilmalarda ishlaydi."
                };
            }

            if (!isBillingReady) {
                try {
                    await plugin.initialize();
                    isBillingReady = true;
                } catch (e) {
                    return {
                        success: false,
                        error: 'BILLING_UNAVAILABLE',
                        message: "Google Play xizmatiga ulanib bo'lmadi. Qurilma va internet aloqasini tekshiring."
                    };
                }
            }

            // Ensure product details are available
            if (!cachedPlans[planToBuy]) {
                await this.fetchProductDetails();
            }

            const offerToken = (cachedPlans[planToBuy] && cachedPlans[planToBuy].offerToken)
                ? cachedPlans[planToBuy].offerToken
                : '';

            try {
                const result = await plugin.launchBillingFlow({
                    productId: CONFIG.productId,
                    basePlanId: planToBuy,
                    offerToken: offerToken
                });

                console.log('[Billing] launchBillingFlow resolved:', result);

                if (result.canceled) {
                    return {
                        success: false,
                        canceled: true,
                        message: "Xarid bekor qilindi."
                    };
                }

                if (result.pending) {
                    // Strict requirement: PENDING does NOT grant PRO!
                    setProState(false);
                    return {
                        success: false,
                        pending: true,
                        message: "To'lov kutilmoqda (Pending). Mablag' yechilib, to'lov tasdiqlangach PRO avtomatik faollashadi."
                    };
                }

                if (result.success && result.purchaseState === 1) {
                    // Complete purchase
                    if (!result.isAcknowledged && result.purchaseToken) {
                        await this.acknowledge(result.purchaseToken);
                    }
                    setProState(true);
                    return {
                        success: true,
                        message: "Calculator PRO obunasi muvaffaqiyatli faollashtirildi!"
                    };
                }

                return {
                    success: false,
                    message: result.message || "Xarid amalga oshmadi."
                };

            } catch (err) {
                console.warn('[Billing] purchase exception:', err);
                return {
                    success: false,
                    error: err && err.code ? err.code : 'UNKNOWN',
                    message: (err && err.message) ? err.message : "Xarid jarayonida kutilmagan xatolik yuz berdi."
                };
            }
        },

        // Restore purchases via Google Play
        async restorePurchases() {
            const plugin = getBillingPlugin();

            if (!checkIsNative() || !plugin) {
                return {
                    success: false,
                    error: 'NOT_NATIVE',
                    message: "Xaridni tiklash faqat Android ilovada ishlaydi."
                };
            }

            try {
                if (!isBillingReady) {
                    await plugin.initialize();
                    isBillingReady = true;
                }

                const res = await plugin.queryActivePurchases();
                console.log('[Billing] restorePurchases response:', res);

                if (res && res.hasActiveSubscription && Array.isArray(res.purchases) && res.purchases.length > 0) {
                    const validPurchase = res.purchases.find(p => p.purchaseState === 1);
                    if (validPurchase) {
                        if (!validPurchase.isAcknowledged && validPurchase.purchaseToken) {
                            await this.acknowledge(validPurchase.purchaseToken);
                        }
                        setProState(true);
                        return {
                            success: true,
                            message: "Faol obunangiz muvaffaqiyatli tiklandi!"
                        };
                    }
                }

                // If no active valid subscription is returned, DO NOT grant PRO!
                setProState(false);
                return {
                    success: false,
                    notFound: true,
                    message: "Ushbu Google Play hisobida faol obuna topilmadi."
                };

            } catch (err) {
                console.warn('[Billing] restorePurchases exception:', err);
                return {
                    success: false,
                    error: err && err.code ? err.code : 'UNKNOWN',
                    message: "Xaridni tekshirishda xatolik: " + ((err && err.message) ? err.message : "Tarmoqqa ulanib bo'lmadi.")
                };
            }
        },

        // Public Entitlement Check
        isUserPro() {
            return isProActive;
        },

        // Selected plan accessors
        getSelectedPlan() {
            return selectedPlanId;
        },

        setSelectedPlan(planId) {
            if (planId === 'monthly' || planId === 'yearly') {
                selectedPlanId = planId;
            }
        },

        getCachedPlans() {
            return cachedPlans;
        },

        // Register callback for PRO entitlement changes
        onProStateChanged(callback) {
            if (typeof callback === 'function') {
                stateChangeListeners.push(callback);
            }
        }
    };

    window.BillingController = BillingController;

    // Automatic initialization on document ready
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                BillingController.init();
            });
        } else {
            BillingController.init();
        }
    }
})(window);
