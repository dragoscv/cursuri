import '@testing-library/jest-dom';

// Load environment variables from .env.local for testing
// This ensures Firebase credentials and other env vars are available
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

// Add Node.js polyfills required by Firebase Admin SDK and gRPC
if (typeof global.setImmediate === 'undefined') {
  global.setImmediate = (callback, ...args) => {
    return setTimeout(callback, 0, ...args);
  };
  global.clearImmediate = (id) => {
    return clearTimeout(id);
  };
}

// Add fetch polyfill for Node.js environment (required for Firebase/Firewand)
global.fetch = global.fetch || async function (url, options = {}) {
  return new Promise((resolve) => {
    resolve(new Response('{}', { status: 200, statusText: 'OK' }));
  });
};

// Firebase will be mocked via moduleNameMapper in jest.config.js
// This avoids ESM import issues while providing functional testing

// Mock Firebase globals for tests that expect them
global.firebaseApp = {
  name: '[DEFAULT]',
  options: { projectId: 'test-project' }
};

global.firestoreDB = {
  app: global.firebaseApp,
  collection: jest.fn(),
  doc: jest.fn()
};

// Global test timeout for real Firebase operations
jest.setTimeout(30000);

// Real Request and Response classes (Node.js 18+ has these built-in)
// Keep for backwards compatibility if needed
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(url, init = {}) {
      this.url = url;
      this.method = init.method || 'GET';
      this.headers = new Map(Object.entries(init.headers || {}));
      this.body = init.body;
    }

    async json() {
      try {
        return JSON.parse(this.body || '{}');
      } catch {
        return {};
      }
    }

    async text() {
      return this.body || '';
    }
  };
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.statusText = init.statusText || 'OK';
      this.headers = new Map(Object.entries(init.headers || {}));
      this.ok = this.status >= 200 && this.status < 300;
    }

    static json(data, init = {}) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init.headers
        }
      });
    }

    async json() {
      try {
        return JSON.parse(this.body);
      } catch {
        return {};
      }
    }

    async text() {
      return this.body || '';
    }
  };
}

// Only mock browser APIs that don't exist in Node.js test environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock browser-only APIs
global.IntersectionObserver = class IntersectionObserver {
  constructor() { }
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
};

global.ResizeObserver = class ResizeObserver {
  constructor() { }
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
};