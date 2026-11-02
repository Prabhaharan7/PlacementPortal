/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#F1F5F9', // Slate 100
                    dark: '#E2E8F0',    // Slate 200
                },
                secondary: '#F8FAFC',   // Slate 50
                accent: {
                    DEFAULT: '#3B82F6',
                    hover: '#2563EB',
                    light: '#60A5FA',
                },
                success: '#10B981',
                warning: '#F59E0B',
                danger: '#EF4444',
                card: '#FFFFFF',
                border: '#E2E8F0',      // Slate 200
                'text-primary': '#0F172A', // Slate 900
                'text-secondary': '#64748B', // Slate 500
            },
            fontFamily: {
                display: ['Clash Display', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'slide-in': 'slideIn 0.3s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideIn: {
                    '0%': { transform: 'translateX(-20px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
