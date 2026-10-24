/**
 * AdMobController - Modular Google AdMob Handler for Calculator App
 * Runs exclusively in Capacitor Native Android environment.
 * In Web / Vercel environments, gracefully defaults to no-op (zero errors).
 */
(function(window) {
    'use strict';

    // Official Google AdMob Test IDs (Safe for Closed Testing)
    const AD_CONFIG = {
        appId: 'ca-app-pub-3940256099942544~3347511713',
        bannerId: 'ca-app-pub-3940256099942544/6300978111',
        interstitialId: 'ca-app-pub-3940256099942544/1033173712'
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
        try {
            return localStorage.getItem('isUserPro') === 'true';
        } catch (e) {
            return false;
        }
    }

    const AdMobController = {
        // Initialize AdMob when running natively
        async init() {
            isNative = checkIsNative();
            if (!isNative) {
                // Vercel / Web browser: do nothing, zero errors
                return;
            }

            const AdMob = getAdMobPlugin();
            if (!AdMob) return;

            try {
                await AdMob.initialize({
                    requestTrackingAuthorization: true,
                    testingDevices: ['EMULATOR'],
                    initializeForTesting: true
                });
                isInitialized = true;

                if (!isUserPro()) {
                    await this.showBanner();
                    await this.prepareInterstitial();
                }

                if (typeof AdMob.addListener === 'function') {
                    AdMob.addListener('interstitialAdDismissed', () => {
                        isInterstitialReady = false;
                        lastAdShownTime = Date.now();
                        setTimeout(() => {
                            AdMobController.prepareInterstitial();
                        }, 5000);
                    });
                    AdMob.addListener('interstitialAdFailedToLoad', () => {
                        isInterstitialLoading = false;
                        isInterstitialReady = false;
                    });
                    AdMob.addListener('interstitialAdLoaded', () => {
                        isInterstitialLoading = false;
                        isInterstitialReady = true;
                    });
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

            try {
                await AdMob.showBanner({
                    adId: AD_CONFIG.bannerId,
                    adSize: 'BANNER',
                    position: 'BOTTOM_CENTER',
                    margin: 0,
                    isTesting: true
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

            try {
                isInterstitialLoading = true;
                await AdMob.prepareInterstitial({
                    adId: AD_CONFIG.interstitialId,
                    isTesting: true
                });
            } catch (err) {
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
