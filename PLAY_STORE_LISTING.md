# Google Play Store Listing & Deployment Guide

## 📱 App Metadata

- **App Name (Uzbek):** Kalkulyator va Birliklar Almashtirgichi
- **App Name (English):** Modern Calculator & Unit Converter
- **Short Description (Uzbek):** Zamonaviy, tezkor kalkulyator va 12 tildagi birliklar almashtirgichi. Dark/Light rejimlari va Pro imkoniyatlar.
- **Short Description (English):** Sleek, modern calculator & multi-category unit converter with 12 world languages, RTL & Pro features.
- **Category:** Tools / Productivity
- **Content Rating:** Everyone (3+)
- **Target Audience:** All ages

---

## 📢 Google AdMob Integration Details

- **AdMob App ID:** `ca-app-pub-2910631304019617~9548598201`
- **Banner Ad Unit ID:** `ca-app-pub-2910631304019617/1729963728`
- **Integration Status:** Live AdMob Ads SDK initialized in `index.html` and `manifest.json`. Auto-hidden in PRO mode (`isUserPro = true`).

---

## 🚀 How to Build Android APK for Testing & Google Play Publishing

### Option 1: Using PWABuilder (Recommended & Fast - 2 minutes)

1. Deploy `d:\CalculatorApp` files to Vercel or GitHub Pages (e.g. `https://your-calculator-app.vercel.app`).
2. Go to [PWABuilder.com](https://www.pwabuilder.com/).
3. Enter your deployed URL and click **Start**.
4. Click **Package for Stores** -> Select **Android**.
5. PWABuilder will automatically include your AdMob App ID `ca-app-pub-2910631304019617~9548598201` and generate a signed `.apk` (for testing on your phone) and `.aab` (for Google Play Store upload).
6. Install the `.apk` on your Android phone and test live/test AdMob banner ads!

### Option 2: Using AppsGeyser / Web2App

1. Upload `d:\calculator_flat.zip` directly to [AppsGeyser.com](https://appsgeyser.com/) or any HTML5 App Builder.
2. Download the resulting `.apk` file directly to your phone.

---

## 📝 Full Description (Uzbek)

Sizning kunlik hisob-kitoblaringiz va o'lchov birliklarini tezkor almashtirish uchun yaratilgan eng zamonaviy, qulay va bepul kalkulyator ilovasi!

Asosiy imkoniyatlar:
- 🧮 Oddiy va Ilmiy kalkulyator rejimi (sin, cos, tan, log, ildiz, daraja)
- 📏 7 xil Kategoriya bo'yicha Birliklar Almashtirgichi (Uzunlik, Massa, Harorat, Maydon, Hajm, Tezlik, Ma'lumot)
- 🌐 12 ta Top Dunyo Tillari va Arabcha (RTL) qo'llab-quvvatlash
- 🌗 Variant A (Slate Dark) va Variant B (Soft Light) hamda PRO eksklyuziv mavzular (Gold Luxe & Cyberpunk)
- 📜 Hisob-kitoblar tarixi va Ma'lumotlarni Zahiraviy nusxalash (Export / Import JSON)
- 💎 Reklamani o'chirish va PRO statusini faollashtirish
- 📳 Haqiqiy bosish hissi (Haptic Tactile Feedback)

---

## 🔒 Privacy Policy

The privacy policy HTML file is included in `privacy_policy.html`. Upload this file to your hosting or GitHub Pages to provide the mandatory URL during Play Console setup.
