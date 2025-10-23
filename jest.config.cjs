const nextJest = require('next/jest');

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files
    dir: './',
});

// Custom Jest configuration
const customJestConfig = {
    // Test environment
    testEnvironment: 'jest-environment-jsdom',

    // Setup files after environment is set up
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

    // Test paths
    testMatch: [
        '**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)',
        '**/?(*.)+(spec|test).(js|jsx|ts|tsx)'
    ],

    // Module name mapping for absolute imports and assets
    moduleNameMapper: {
        '^@/components/(.*)$': '<rootDir>/components/$1',
        '^@/utils/(.*)$': '<rootDir>/utils/$1',
        '^@/types/(.*)$': '<rootDir>/types/$1',
        '^@/config/(.*)$': '<rootDir>/config/$1',
        '^@/app/(.*)$': '<rootDir>/app/$1',
        // Map next-intl to test mock for Jest compatibility
        '^next-intl$': '<rootDir>/__mocks__/next-intl.js',
        // Use real Firebase connections - no mocks
        // Use real Framer Motion - no mocks
    },

    // Files to ignore
    testPathIgnorePatterns: [
        '<rootDir>/.next/',
        '<rootDir>/node_modules/',
        '<rootDir>/cypress/',
        '<rootDir>/playwright-report/',
        '<rootDir>/__tests__/helpers/',
        '<rootDir>/__tests__/api/helpers/'
    ],

    // Transform configuration
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
    },

    // Transform ESM modules including Firebase, Firewand, Framer Motion, HeroUI, and next-intl
    transformIgnorePatterns: [
        'node_modules/(?!(firebase|@firebase|firewand|framer-motion|@heroui|next-intl|use-intl)/).*'
    ],

    // Module file extensions
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

    // Coverage configuration
    collectCoverageFrom: [
        'components/**/*.{js,jsx,ts,tsx}',
        'utils/**/*.{js,jsx,ts,tsx}',
        'app/**/*.{js,jsx,ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/.next/**',
        '!**/coverage/**',
    ],

    // Coverage thresholds
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },

    // Verbose output
    verbose: true,

    // Bail after first test failure for faster feedback during development
    bail: 5,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config
module.exports = createJestConfig(customJestConfig);