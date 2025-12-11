module.exports = {
    extends: ['../../.eslintrc.js'],
    env: {
        browser: true,
    },
    rules: {
        // React-specific rules can go here
        'react/prop-types': 'off', // Using TypeScript for prop validation
    },
};
