/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    900: '#121212',
                    800: '#1e1e1e',
                    700: '#2c2c2c',
                    600: '#3a3a3a',
                },
                primary: {
                    DEFAULT: '#3b82f6',
                    hover: '#2563eb',
                },
                accent: {
                    DEFAULT: '#8b5cf6',
                    hover: '#7c3aed',
                }
            },
            animation: {
                'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'ping-slow': 'ping 20s cubic-bezier(0, 0, 0.2, 1) infinite',
            },
        },
    },
    plugins: [],
}
