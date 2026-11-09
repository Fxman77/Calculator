/**
 * AdMobController - Modular Google AdMob Handler for Calculator App
 * Runs exclusively in Capacitor Native Android environment.
 * In Web / Vercel environments, gracefully defaults to no-op (zero errors).
 */
(function(window) {
    'use strict';

    // Official Google AdMob Production IDs for Calculator & Converter
    const AD_CONFIG = {
        appId: 'ca-app-pub-2910631304019617~9548598201',
        bannerId: 'ca-app-pub-2910631304019617/1729963728',
        interstitialId: 'ca-app-pub-2910631304019617/8335124239'
    };

    // Natural Pacing rules for Interstitial to ensure pleasant UX
    const PACING = {
        minCalculationsBeforeAd: 6,    // At least 6 calculations between ads
        minTimeBetweenAdsMs: 75000,    // At least 75 seconds between full-screen ads
        minTabSwitchesBeforeAd: 4      // At least 4 tab switches between ads
    };

    let isNative = false;
    let isInitialized = false;
    let calculationCount = 0;
    let tabSwitchCount = 0;
    let lastAdShownTime = Date.now();
    let isInterstitialLoading = false;
    let isInterstitialReady = false;

    // Helper: Safely detect Capacitor native Android environment
    function checkIsNative() {
        return !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());
    }

    // Helper: Safely access native AdMob plugin
    function getAdMobPlugin() {
        if (!checkIsNative()) return null;
        return (window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob) ? window.Capacitor.Plugins.AdMob : null;
    }

    // Helper: Check PRO status
    function isUserPro() {
        if (typeof window !== 'undefined' && window.BillingController && typeof window.BillingController.isUserPro === 'function') {
            return window.BillingController.isUserPro();
        }
        try {
            return localStorage.getItem('isUserPro') === 'true';
        } catch (e) {
            return false;
        }
    }

    // Helper: Determine whether test mode should be active
    // Uses Capacitor's official native runtime flag (window.Capacitor.DEBUG), which is tied
    // directly to Android's ApplicationInfo.FLAG_DEBUGGABLE:
    //   - Debug build (assembleDebug): window.Capacitor.DEBUG is true -> isTesting: true
    //   - Release build (bundleRelease / assembleRelease): window.Capacitor.DEBUG is false -> isTesting: false
    function isTestingMode() {
        if (typeof window !== 'undefined' && typeof window.__ADMOB_TEST_MODE__ === 'boolean') {
            return window.__ADMOB_TEST_MODE__;
        }
        if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.DEBUG === true) {
            return true;
        }
        return false;
    }

    const AdMobController = {
        // Initialize AdMob when running natively
        async init() {
            if (isInitialized) return;

            isNative = checkIsNative();
            if (!isNative) {
                // Vercel / Web browser: do nothing, zero errors
                return;
            }

            // Hide empty HTML AdSense placeholder only on native Android
            const htmlBanner = document.getElementById('adMobBanner');
            if (htmlBanner) {
                htmlBanner.style.display = 'none';
            }

            const AdMob = getAdMobPlugin();
            if (!AdMob) return;

            // Register listeners BEFORE initializing and loading ads
            if (typeof AdMob.addListener === 'function') {
                AdMob.addListener('bannerAdLoaded', () => {
                    console.log('[AdMob] Banner loaded successfully');
                });
                AdMob.addListener('bannerAdFailedToLoad', (err) => {
                    console.warn('[AdMob] Banner failed to load:', err);
                });
                AdMob.addListener('interstitialAdDismissed', () => {
                    isInterstitialReady = false;
                    lastAdShownTime = Date.now();
                    setTimeout(() => {
                        AdMobController.prepareInterstitial();
                    }, 5000);
                });
                AdMob.addListener('interstitialAdFailedToLoad', (err) => {
                    console.warn('[AdMob] Interstitial failed to load:', err);
                    isInterstitialLoading = false;
                    isInterstitialReady = false;
                });
                AdMob.addListener('interstitialAdLoaded', (info) => {
                    console.log('[AdMob] Interstitial loaded and ready:', info);
                    isInterstitialLoading = false;
                    isInterstitialReady = true;
                });
            }

            try {
                await AdMob.initialize({
                    initializeForTesting: true,
                    testingDevices: [
                        'EMULATOR',
                        '9B63947FE9900B5DE1BCD0F4F9169188', // Production package (myapp.fxman77) on Infinix X682C
                        '5380B46B10312A2A3EE2E044D31DA098'  // Debug package (myapp.fxman77.debug) on Infinix X682C
                    ]
                });
                isInitialized = true;
                console.log('[AdMob] Native SDK initialized successfully. Test mode:', isTestingMode());

                if (!isUserPro()) {
                    await this.showBanner();
                    await this.prepareInterstitial();
                }
            } catch (err) {
                console.warn('[AdMobController] Native init bypassed:', err && err.message ? err.message : err);
            }
        },

        // Show bottom native banner safely
        async showBanner() {
            if (!isNative || isUserPro()) return;
            const AdMob = getAdMobPlugin();
            if (!AdMob) return;

            const isTest = isTestingMode();
            try {
                await AdMob.showBanner({
                    adId: AD_CONFIG.bannerId,
                    adSize: 'BANNER',
                    position: 'BOTTOM_CENTER',
                    margin: 0,
                    isTesting: isTest
                });
            } catch (err) {
                console.warn('[AdMobController] showBanner:', err && err.message ? err.message : err);
            }
        },

        // Hide and remove banner (for PRO mode)
        async removeBanner() {
            if (!isNative) return;
            const AdMob = getAdMobPlugin();
            if (!AdMob) return;

            try {
                await AdMob.hideBanner();
                await AdMob.removeBanner();
            } catch (err) {
                // Ignore if not present
            }
        },

        // Preload Interstitial in background
        async prepareInterstitial() {
            if (!isNative || isUserPro() || isInterstitialLoading || isInterstitialReady) return;
            const AdMob = getAdMobPlugin();
            if (!AdMob) return;

            const isTest = isTestingMode();
            try {
                isInterstitialLoading = true;
                await AdMob.prepareInterstitial({
                    adId: AD_CONFIG.interstitialId,
                    isTesting: isTest
                });
            } catch (err) {
                console.warn('[AdMobController] prepareInterstitial failed:', err && err.message ? err.message : err);
                isInterstitialLoading = false;
                isInterstitialReady = false;
            }
        },

        // Check conditions and show Interstitial at natural breaks
        async maybeShowInterstitial(reason) {
            if (!isNative || isUserPro()) return;
            const now = Date.now();
            if (now - lastAdShownTime < PACING.minTimeBetweenAdsMs) {
                return; // Cooldown period active
            }

            const AdMob = getAdMobPlugin();
            if (!AdMob) return;

            try {
                if (isInterstitialReady) {
                    await AdMob.showInterstitial();
                    lastAdShownTime = now;
                    calculationCount = 0;
                    tabSwitchCount = 0;
                } else {
                    this.prepareInterstitial();
                }
            } catch (err) {
                console.warn('[AdMobController] showInterstitial:', err && err.message ? err.message : err);
            }
        },

        // Hook: Called when calculation completes
        onCalculationCompleted() {
            if (!isNative || isUserPro()) return;
            calculationCount++;
            if (calculationCount >= PACING.minCalculationsBeforeAd) {
                this.maybeShowInterstitial('calculation');
            }
        },

        // Hook: Called on tab navigation
        onTabSwitched(tabName) {
            if (!isNative || isUserPro()) return;
            tabSwitchCount++;
            if (tabSwitchCount >= PACING.minTabSwitchesBeforeAd) {
                this.maybeShowInterstitial('tab_switch');
            }
        },

        // Hook: When PRO mode is active
        onProActivated() {
            this.removeBanner();
        },

        // Hook: When PRO mode is inactive
        onProDeactivated() {
            if (isNative) {
                this.showBanner();
                this.prepareInterstitial();
            }
        }
    };

    window.AdMobController = AdMobController;

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                AdMobController.init();
            });
        } else {
            AdMobController.init();
        }
    }
})(window);
