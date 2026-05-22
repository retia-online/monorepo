// Configuración específica para builds de staging/APK
// Este archivo se usa para builds con variables compiladas

module.exports = {
  expo: {
    name: "Retia Staging",
    slug: "retia-staging",
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
      bundleIdentifier: "com.retia.staging",
      buildNumber: "1.0.0"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.retia.staging",
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
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://retia-app-staging.vercel.app",
      authMode: process.env.EXPO_PUBLIC_AUTH_MODE || "required",
      authMethods: process.env.EXPO_PUBLIC_AUTH_METHODS || "email,google",
      instance: process.env.EXPO_PUBLIC_INSTANCE || "Retia-Staging",
      mainScreenMessage: process.env.EXPO_PUBLIC_MAIN_SCREEN_MESSAGE || "¡Bienvenido a Retia Staging!",
      primaryColor: process.env.EXPO_PUBLIC_PRIMARY_COLOR || "6366f1",
      secondaryColor: process.env.EXPO_PUBLIC_SECONDARY_COLOR || "ec4899",
      backgroundColor: process.env.EXPO_PUBLIC_BACKGROUND_COLOR || "f8fafc",
      textColor: process.env.EXPO_PUBLIC_TEXT_COLOR || "1e293b",
      fontFamily: process.env.EXPO_PUBLIC_FONT_FAMILY || "Manrope",
      defaultLocale: process.env.EXPO_PUBLIC_DEFAULT_LOCALE || "es",
      locales: process.env.EXPO_PUBLIC_LOCALES || "es,en,pt",
      // OAuth config
      googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "",
      facebookAppId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || "",
      odooUrl: process.env.EXPO_PUBLIC_ODOO_URL || "https://labs.retia.vzla.online/",
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