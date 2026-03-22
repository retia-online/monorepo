/** @type {import('tailwindcss').Config} */

module.exports = {
    presets: [require('@retia-global/configs/tailwind.preset')],
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
};
