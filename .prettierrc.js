module.exports = {
    // Formatting options
    semi: true,
    trailingComma: 'es5',
    singleQuote: true,
    printWidth: 100,
    tabWidth: 4,
    useTabs: false,

    // JSX/TSX
    jsxSingleQuote: false,
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: 'always',

    // File-specific overrides
    overrides: [
        {
            files: '*.json',
            options: {
                tabWidth: 2,
            },
        },
        {
            files: ['*.yml', '*.yaml'],
            options: {
                tabWidth: 2,
            },
        },
    ],
};
