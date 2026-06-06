// Configuración específica para builds de staging/APK
// Este archivo se usa para builds con variables compiladas

module.exports = {
  expo: {
    name: process.env.EXPO_PUBLIC_APP_NAME ? `${process.env.EXPO_PUBLIC_APP_NAME} Staging` : "Core App Staging",
    slug: process.env.EXPO_PUBLIC_APP_SLUG ? `${process.env.EXPO_PUBLIC_APP_SLUG}-staging` : "core-app-staging",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: process.env.EXPO_PUBLIC_BUNDLE_ID ? `${process.env.EXPO_PUBLIC_BUNDLE_ID}.staging` : "com.core.app.staging",
      buildNumber: "1.0.0"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: process.env.EXPO_PUBLIC_PACKAGE_NAME ? `${process.env.EXPO_PUBLIC_PACKAGE_NAME}.staging` : "com.core.app.staging",
      versionCode: 1,
      permissions: [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      // Variables compiladas en el build
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "",
      authMode: process.env.EXPO_PUBLIC_AUTH_MODE || "required",
      authMethods: process.env.EXPO_PUBLIC_AUTH_METHODS || "email,google",
      instance: process.env.EXPO_PUBLIC_INSTANCE || "Core-Staging",
      mainScreenMessage: process.env.EXPO_PUBLIC_MAIN_SCREEN_MESSAGE || "¡Bienvenido!",
      primaryColor: process.env.EXPO_PUBLIC_PRIMARY_COLOR || "3b82f6",
      secondaryColor: process.env.EXPO_PUBLIC_SECONDARY_COLOR || "10b981",
      backgroundColor: process.env.EXPO_PUBLIC_BACKGROUND_COLOR || "ffffff",
      textColor: process.env.EXPO_PUBLIC_TEXT_COLOR || "1f2937",
      fontFamily: process.env.EXPO_PUBLIC_FONT_FAMILY || "Manrope",
      defaultLocale: process.env.EXPO_PUBLIC_DEFAULT_LOCALE || "es",
      locales: process.env.EXPO_PUBLIC_LOCALES || "es,en,pt",
      // OAuth config
      googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "",
      facebookAppId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || "",
      odooUrl: process.env.EXPO_PUBLIC_ODOO_URL || "",
      // Analytics (opcional)
      metaPixelId: process.env.EXPO_PUBLIC_META_PIXEL_ID || "",
      tiktokPixelId: process.env.EXPO_PUBLIC_TIKTOK_PIXEL_ID || "",
      linkedinInsightTag: process.env.EXPO_PUBLIC_LINKEDIN_INSIGHT_TAG || "",
      xPixelId: process.env.EXPO_PUBLIC_X_PIXEL_ID || "",
      pinterestTagId: process.env.EXPO_PUBLIC_PINTEREST_TAG_ID || "",
      gtmId: process.env.EXPO_PUBLIC_GTM_ID || "",
      // Environment flag
      environment: "staging",
      eas: {
        projectId: "your-project-id-here" // Reemplazar con tu projectId real
      }
    },
    updates: {
      url: "https://u.expo.dev/your-project-id" // Reemplazar con tu URL real
    },
    runtimeVersion: {
      policy: "sdkVersion"
    }
  }
};