// Dynamic configuration for Expo Mobile App
// Supports loading white-label metadata from environment variables (.env.local)

module.exports = {
  expo: {
    name: process.env.EXPO_PUBLIC_APP_NAME || "Core App",
    slug: process.env.EXPO_PUBLIC_APP_SLUG || "core-app",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    splash: {
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      bundleIdentifier: process.env.EXPO_PUBLIC_BUNDLE_ID || "com.core.app"
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff"
      },
      package: process.env.EXPO_PUBLIC_PACKAGE_NAME || "com.core.app",
      permissions: [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE"
      ],
      allowBackup: false,
      usesCleartextTraffic: true
    },
    web: {},
    plugins: [
      "expo-secure-store",
      "expo-web-browser"
    ],
    scheme: process.env.EXPO_PUBLIC_SCHEME || "coreapp",
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:9001",
      authMode: process.env.EXPO_PUBLIC_AUTH_MODE || "required",
      authMethods: process.env.EXPO_PUBLIC_AUTH_METHODS || "email,google",
      instance: process.env.EXPO_PUBLIC_INSTANCE || "Core-Local",
      mainScreenMessage: process.env.EXPO_PUBLIC_MAIN_SCREEN_MESSAGE || "¡Bienvenido a la Plataforma!",
      primaryColor: process.env.EXPO_PUBLIC_PRIMARY_COLOR || "3b82f6",
      secondaryColor: process.env.EXPO_PUBLIC_SECONDARY_COLOR || "10b981",
      backgroundColor: process.env.EXPO_PUBLIC_BACKGROUND_COLOR || "ffffff",
      textColor: process.env.EXPO_PUBLIC_TEXT_COLOR || "1f2937",
      fontFamily: process.env.EXPO_PUBLIC_FONT_FAMILY || "Manrope",
      defaultLocale: process.env.EXPO_PUBLIC_DEFAULT_LOCALE || "es",
      locales: process.env.EXPO_PUBLIC_LOCALES || "es,en,pt",
      googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "",
      facebookAppId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || "",
      odooUrl: process.env.EXPO_PUBLIC_ODOO_URL || ""
    }
  }
};
