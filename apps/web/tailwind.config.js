/** @type {import('tailwindcss').Config} */

module.exports = {
    presets: [require('@core/configs/tailwind.preset')],
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
};
