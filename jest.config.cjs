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
        '**/__tests__/**/*.(js|jsx|ts|tsx)',
        '**/?(*.)+(spec|test).(js|jsx|ts|tsx)'
    ],

    // Module name mapping for absolute imports and assets
    moduleNameMapper: {
        '^@/components/(.*)$': '<rootDir>/components/$1',
        '^@/utils/(.*)$': '<rootDir>/utils/$1',
        '^@/types/(.*)$': '<rootDir>/types/$1',
        '^@/config/(.*)$': '<rootDir>/config/$1',
        '^@/app/(.*)$': '<rootDir>/app/$1',
        // Mock Firebase modules to avoid ESM issues
        '^firebase/(.*)$': '<rootDir>/__mocks__/firebase.js',
        '^firewand$': '<rootDir>/__mocks__/firewand.js',
        // Mock Framer Motion to avoid ESM issues
        '^framer-motion$': '<rootDir>/__mocks__/framer-motion.js',
    },

    // Files to ignore
    testPathIgnorePatterns: [
        '<rootDir>/.next/',
        '<rootDir>/node_modules/',
        '<rootDir>/cypress/',
        '<rootDir>/playwright-report/'
    ],

    // Transform configuration
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
    },

    // Ignore node_modules except for specific packages that need transformation
    transformIgnorePatterns: [
        '/node_modules/(?!(firebase|@firebase|firewand)/)'
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