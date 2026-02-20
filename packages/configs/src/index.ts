// Main exports for @megamercado-vzla/configs package
// Note: Configuration files are exported directly as JS files
// TypeScript configurations are exported as JSON files

// Export types for better IDE support
export interface TailwindPreset {
  theme: {
    extend: {
      colors: Record<string, string>;
      fontFamily: Record<string, string[]>;
    };
  };
  plugins: any[];
}

export interface ESLintConfig {
  files?: string[];
  languageOptions?: any;
  plugins?: any;
  rules?: any;
}

// Re-export configurations
// These will be available as: require('@megamercado-vzla/configs/tailwind.preset')
// Import TypeScript configs like: require('@megamercado-vzla/configs/tsconfig.base.json')