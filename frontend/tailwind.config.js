/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#0052FF', // Example premium blue
                secondary: '#1E1E1E', // Dark gray
                accent: '#FFD700', // Gold/Yellow for Botswana vibes? Or maybe just a nice accent.
            },
        },
    },
    plugins: [],
}
