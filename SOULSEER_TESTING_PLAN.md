# SoulSeer Testing Plan

## Overview
This document outlines the comprehensive testing strategy for the SoulSeer spiritual consultation platform. The plan covers unit testing, integration testing, end-to-end testing, performance testing, security testing, and accessibility testing to ensure a robust, reliable, and high-quality application.

## Testing Philosophy

### Testing Principles
- **Shift Left**: Test early and often in the development cycle
- **Comprehensive Coverage**: Test all critical user journeys and edge cases
- **Automation First**: Automate tests wherever possible
- **Continuous Testing**: Integrate testing into CI/CD pipeline
- **Risk-Based Testing**: Prioritize testing based on business impact

### Testing Pyramid
```
        ┌─────────────┐
        │   E2E Tests │  <- 10% (Critical user journeys)
        ├─────────────┤
        │ Integration │  <- 20% (API, component interactions)
        │   Tests     │
        ├─────────────┤
        │  Unit Tests │  <- 70% (Individual components, functions)
        └─────────────┘
```

## Testing Tools & Technologies

### Unit Testing
- **Jest**: JavaScript testing framework
- **React Testing Library**: React component testing
- **Vitest**: Fast unit testing for Vite environment
- **Mock Service Worker (MSW)**: API mocking

### Integration Testing
- **Supertest**: HTTP assertions for API testing
- **Testing Library**: Integration testing utilities
- **Playwright**: Browser automation for integration tests
- **Prisma Test Utils**: Database testing utilities

### E2E Testing
- **Playwright**: E2E testing framework
- **Cypress**: Alternative E2E testing tool
- **Puppeteer**: Headless Chrome automation

### Performance Testing
- **Lighthouse**: Web performance auditing
- **WebPageTest**: Performance analysis
- **k6**: Load testing
- **Artillery**: Performance testing

### Security Testing
- **OWASP ZAP**: Security vulnerability scanning
- **Snyk**: Dependency vulnerability scanning
- **ESLint Security**: Security linting rules
- **Helmet.js**: Security headers testing

### Accessibility Testing
- **axe-core**: Accessibility testing engine
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse Accessibility**: Accessibility auditing
- **Screen Readers**: Manual testing with NVDA, VoiceOver

## Testing Environment Setup

### Test Database
```typescript
// tests/setup/test-database.ts
import { PrismaClient } from '@prisma/client';

export const createTestDatabase = async () => {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.TEST_DATABASE_URL
      }
    }
  });

  // Clean up existing test data
  await prisma.user.deleteMany();
  await prisma.session.deleteMany();
  await prisma.transaction.deleteMany();

  return prisma;
};

export const seedTestData = async (prisma: PrismaClient) => {
  // Create test users
  const testClient = await prisma.user.create({
    data: {
      email: 'test-client@example.com',
      username: 'testclient',
      passwordHash: 'hashed_password',
      role: 'CLIENT',
      clientProfile: {
        create: {
          firstName: 'Test',
          lastName: 'Client',
          bio: 'Test client for testing'
        }
      }
    }
  });

  const testReader = await prisma.user.create({
    data: {
      email: 'test-reader@example.com',
      username: 'testreader',
      passwordHash: 'hashed_password',
      role: 'READER',
      readerProfile: {
        create: {
          firstName: 'Test',
          lastName: 'Reader',
          bio: 'Test reader for testing',
          specialties: ['tarot', 'astrology'],
          experience: 5,
          pricing: {
            chat: 2.50,
            call: 3.00,
            video: 4.00
          }
        }
      }
    }
  });

  return { testClient, testReader };
};
```

### Test Configuration
```typescript
// tests/setup/jest.config.ts
import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
    '!src/app/page.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default createJestConfig(config);
```

## Unit Testing Strategy

### 1. Component Testing

#### React Components
```typescript
// tests/components/auth/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';

// Mock the auth hook
jest.mock('@/hooks/useAuth');

describe('LoginForm', () => {
  const mockLogin = jest.fn();
  
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
    });
  });

  it('renders login form correctly', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('displays validation errors for invalid input', async () => {
    render(<LoginForm />);
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('displays loading state during submission', () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: true,
      error: null,
    });

    render(<LoginForm />);
    
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });
});
```

#### Hook Testing
```typescript
// tests/hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { authStore } from '@/store/authStore';

// Mock the auth store
jest.mock('@/store/authStore');

describe('useAuth', () => {
  const mockAuthStore = {
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    (authStore as jest.Mock).mockReturnValue(mockAuthStore);
  });

  it('returns auth state and functions', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });

  it('calls login function with correct parameters', async () => {
    const { result } = renderHook(() => useAuth());
    const credentials = { email: 'test@example.com', password: 'password123' };

    await act(async () => {
      await result.current.login(credentials);
    });

    expect(mockAuthStore.login).toHaveBeenCalledWith(credentials);
  });

  it('calls logout function', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.logout();
    });

    expect(mockAuthStore.logout).toHaveBeenCalled();
  });
});
```

### 2. Utility Function Testing

```typescript
// tests/utils/formatting.test.ts
import { formatCurrency, formatDate, formatDuration } from '@/utils/formatting';

describe('Formatting Utilities', () => {
  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      expect(formatCurrency(25.50)).toBe('$25.50');
      expect(formatCurrency(100)).toBe('$100.00');
      expect(formatCurrency(0.99)).toBe('$0.99');
    });

    it('handles different currencies', () => {
      expect(formatCurrency(25.50, 'EUR')).toBe('€25.50');
      expect(formatCurrency(1000, 'GBP')).toBe('£1,000.00');
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      expect(formatDate(date)).toBe('Dec 25, 2023');
    });

    it('handles different formats', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      expect(formatDate(date, 'long')).toBe('December 25, 2023');
      expect(formatDate(date, 'short')).toBe('12/25/2023');
    });
  });

  describe('formatDuration', () => {
    it('formats duration correctly', () => {
      expect(formatDuration(65)).toBe('1h 5m');
      expect(formatDuration(30)).toBe('30m');
      expect(formatDuration(3665)).toBe('1h 1m 5s');
    });
  });
});
```

### 3. API Route Testing

```typescript
// tests/api/auth/login.test.ts
import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/auth/login/route';
import { prisma } from '@/lib/db';

// Mock the database
jest.mock('@/lib/db');

describe('POST /api/auth/login', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    passwordHash: 'hashed_password',
    role: 'CLIENT',
  };

  beforeEach(() => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
  });

  it('returns 200 with valid credentials', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
    });

    const res = await POST(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user).toEqual(expect.objectContaining({
      id: mockUser.id,
      email: mockUser.email,
    }));
  });

  it('returns 401 with invalid credentials', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const { req } = createMocks({
      method: 'POST',
      body: {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      },
    });

    const res = await POST(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Invalid credentials');
  });

  it('returns 400 with missing fields', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
      },
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Email and password are required');
  });
});
```

## Integration Testing Strategy

### 1. Component Integration Testing

```typescript
// tests/integration/SessionFlow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionFlow } from '@/components/client/SessionFlow';
import { useSession } from '@/hooks/useSession';
import { useWallet } from '@/hooks/useWallet';

// Mock hooks
jest.mock('@/hooks/useSession');
jest.mock('@/hooks/useWallet');

describe('SessionFlow Integration', () => {
  const mockBookSession = jest.fn();
  const mockWallet = { balance: 50.00, addFunds: jest.fn() };

  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({
      bookSession: mockBookSession,
      isLoading: false,
      error: null,
    });

    (useWallet as jest.Mock).mockReturnValue(mockWallet);
  });

  it('allows booking a session with sufficient balance', async () => {
    render(<SessionFlow readerId="reader1" sessionType="chat" />);

    // Check wallet balance is displayed
    expect(screen.getByText(/balance: \$50\.00/i)).toBeInTheDocument();

    // Click book session button
    fireEvent.click(screen.getByRole('button', { name: /book session/i }));

    await waitFor(() => {
      expect(mockBookSession).toHaveBeenCalledWith({
        readerId: 'reader1',
        sessionType: 'chat',
      });
    });
  });

  it('shows insufficient balance error', () => {
    mockWallet.balance = 1.00;
    (useWallet as jest.Mock).mockReturnValue(mockWallet);

    render(<SessionFlow readerId="reader1" sessionType="chat" />);

    expect(screen.getByText(/insufficient balance/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add funds/i })).toBeInTheDocument();
  });
});
```

### 2. API Integration Testing

```typescript
// tests/integration/PaymentFlow.test.ts
import request from 'supertest';
import { app } from '@/app';
import { prisma } from '@/lib/db';

describe('Payment Flow Integration', () => {
  let testUser: any;
  let testReader: any;

  beforeAll(async () => {
    // Create test data
    testUser = await prisma.user.create({
      data: {
        email: 'test-user@example.com',
        passwordHash: 'hashed_password',
        role: 'CLIENT',
        clientProfile: {
          create: {
            firstName: 'Test',
            lastName: 'User',
          }
        }
      }
    });

    testReader = await prisma.user.create({
      data: {
        email: 'test-reader@example.com',
        passwordHash: 'hashed_password',
        role: 'READER',
        readerProfile: {
          create: {
            firstName: 'Test',
            lastName: 'Reader',
            pricing: { chat: 2.50 }
          }
        }
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: {
        id: {
          in: [testUser.id, testReader.id]
        }
      }
    });
  });

  it('handles complete payment flow', async () => {
    // Add funds to wallet
    const addFundsResponse = await request(app)
      .post('/api/wallet/add-funds')
      .send({
        userId: testUser.id,
        amount: 50.00,
        paymentMethodId: 'pm_test123'
      });

    expect(addFundsResponse.status).toBe(200);

    // Book session
    const bookSessionResponse = await request(app)
      .post('/api/sessions/book')
      .send({
        clientId: testUser.id,
        readerId: testReader.id,
        sessionType: 'chat'
      });

    expect(bookSessionResponse.status).toBe(200);

    // Verify session was created
    const session = await prisma.session.findFirst({
      where: {
        clientId: testUser.id,
        readerId: testReader.id
      }
    });

    expect(session).toBeTruthy();
    expect(session?.status).toBe('SCHEDULED');
  });
});
```

## E2E Testing Strategy

### 1. Critical User Journeys

#### Client Registration to First Session
```typescript
// tests/e2e/client-journey.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Client Journey', () => {
  test('complete client registration to first session', async ({ page }) => {
    // Navigate to registration
    await page.goto('/register');
    
    // Fill registration form
    await page.fill('[data-testid="email"]', 'test-client@example.com');
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.fill('[data-testid="firstName"]', 'Test');
    await page.fill('[data-testid="lastName"]', 'Client');
    
    // Submit registration
    await page.click('[data-testid="register-button"]');
    
    // Wait for dashboard
    await page.waitForURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome, Test');
    
    // Navigate to readers
    await page.click('[data-testid="readers-link"]');
    await page.waitForURL('/readers');
    
    // Select a reader
    await page.click('[data-testid="reader-card"]:first-child');
    
    // Book session
    await page.click('[data-testid="book-session-button"]');
    await page.waitForURL('/sessions/book');
    
    // Add funds if needed
    if (await page.locator('[data-testid="insufficient-balance"]').isVisible()) {
      await page.click('[data-testid="add-funds-button"]');
      await page.fill('[data-testid="amount"]', '50');
      await page.click('[data-testid="confirm-add-funds"]');
    }
    
    // Confirm booking
    await page.click('[data-testid="confirm-booking"]');
    
    // Verify session was booked
    await expect(page.locator('[data-testid="session-confirmed"]')).toBeVisible();
    await expect(page.locator('[data-testid="upcoming-sessions"]')).toContainText('Upcoming Sessions');
  });
});
```

#### Reader Dashboard and Session Management
```typescript
// tests/e2e/reader-journey.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Reader Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Login as reader
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test-reader@example.com');
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/reader/dashboard');
  });

  test('reader can view and manage sessions', async ({ page }) => {
    // Check dashboard elements
    await expect(page.locator('h1')).toContainText('Reader Dashboard');
    await expect(page.locator('[data-testid="earnings-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="session-stats"]')).toBeVisible();
    
    // Navigate to sessions
    await page.click('[data-testid="sessions-link"]');
    await page.waitForURL('/reader/sessions');
    
    // Check session list
    await expect(page.locator('[data-testid="session-list"]')).toBeVisible();
    
    // View session details
    await page.click('[data-testid="session-card"]:first-child');
    await expect(page.locator('[data-testid="session-details"]')).toBeVisible();
  });

  test('reader can update availability', async ({ page }) => {
    // Navigate to schedule
    await page.click('[data-testid="schedule-link"]');
    await page.waitForURL('/reader/schedule');
    
    // Add availability
    await page.click('[data-testid="add-availability"]');
    await page.selectOption('[data-testid="day-of-week"]', '1');
    await page.fill('[data-testid="start-time"]', '09:00');
    await page.fill('[data-testid="end-time"]', '17:00');
    await page.click('[data-testid="save-availability"]');
    
    // Verify availability was added
    await expect(page.locator('[data-testid="availability-item"]')).toBeVisible();
  });
});
```

#### Admin Platform Management
```typescript
// tests/e2e/admin-journey.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Admin Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('[data-testid="email"]', 'admin@soulseer.com');
    await page.fill('[data-testid="password"]', 'AdminPassword123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/admin/dashboard');
  });

  test('admin can manage users', async ({ page }) => {
    // Check dashboard
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
    await expect(page.locator('[data-testid="platform-stats"]')).toBeVisible();
    
    // Navigate to user management
    await page.click('[data-testid="users-link"]');
    await page.waitForURL('/admin/users');
    
    // Search for user
    await page.fill('[data-testid="search-input"]', 'test-client');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify search results
    await expect(page.locator('[data-testid="user-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-card"]')).toContainText('test-client');
    
    // View user details
    await page.click('[data-testid="user-card"]:first-child');
    await expect(page.locator('[data-testid="user-details"]')).toBeVisible();
  });

  test('admin can approve readers', async ({ page }) => {
    // Navigate to reader management
    await page.click('[data-testid="readers-link"]');
    await page.waitForURL('/admin/readers');
    
    // Filter by pending approval
    await page.selectOption('[data-testid="status-filter"]', 'PENDING');
    
    // Approve reader
    await page.click('[data-testid="approve-reader"]:first-child');
    await page.click('[data-testid="confirm-approval"]');
    
    // Verify reader was approved
    await expect(page.locator('[data-testid="approval-success"]')).toBeVisible();
  });
});
```

### 2. WebRTC Session Testing

```typescript
// tests/e2e/webrtc-session.spec.ts
import { test, expect } from '@playwright/test';

test.describe('WebRTC Session', () => {
  test('client and reader can establish video session', async ({ page }) => {
    // Setup browser contexts for both participants
    const clientContext = await browser.newContext();
    const readerContext = await browser.newContext();
    
    const clientPage = await clientContext.newPage();
    const readerPage = await readerContext.newPage();
    
    // Login as client
    await clientPage.goto('/login');
    await clientPage.fill('[data-testid="email"]', 'client@example.com');
    await clientPage.fill('[data-testid="password"]', 'Password123!');
    await clientPage.click('[data-testid="login-button"]');
    
    // Login as reader
    await readerPage.goto('/reader/login');
    await readerPage.fill('[data-testid="email"]', 'reader@example.com');
    await readerPage.fill('[data-testid="password"]', 'Password123!');
    await readerPage.click('[data-testid="login-button"]');
    
    // Client joins session
    await clientPage.goto('/session/test-session-123');
    await clientPage.click('[data-testid="join-session"]');
    
    // Reader joins session
    await readerPage.goto('/reader/session/test-session-123');
    await readerPage.click('[data-testid="start-session"]');
    
    // Verify connection established
    await expect(clientPage.locator('[data-testid="connection-status"]')).toContainText('Connected');
    await expect(readerPage.locator('[data-testid="connection-status"]')).toContainText('Connected');
    
    // Verify video streams
    await expect(clientPage.locator('[data-testid="remote-video"]')).toBeVisible();
    await expect(readerPage.locator('[data-testid="remote-video"]')).toBeVisible();
    
    // Test chat functionality
    await clientPage.fill('[data-testid="chat-input"]', 'Hello from client!');
    await clientPage.click('[data-testid="send-message"]');
    
    await expect(readerPage.locator('[data-testid="chat-messages"]')).toContainText('Hello from client!');
    
    // End session
    await readerPage.click('[data-testid="end-session"]');
    await expect(readerPage.locator('[data-testid="session-ended"]')).toBeVisible();
    
    await clientContext.close();
    await readerContext.close();
  });
});
```

## Performance Testing Strategy

### 1. Load Testing

```typescript
// tests/performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Ramp up to 200 users
    { duration: '5m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% of requests should fail
  },
};

export default function () {
  // Test user authentication
  const loginRes = http.post('https://api.soulseer.com/auth/login', JSON.stringify({
    email: `test-user-${__VU}@example.com`,
    password: 'Password123!',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'login response has token': (r) => JSON.parse(r.body).token !== undefined,
  });

  const token = JSON.parse(loginRes.body).token;

  // Test dashboard loading
  const dashboardRes = http.get('https://api.soulseer.com/client/dashboard', {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  check(dashboardRes, {
    'dashboard status is 200': (r) => r.status === 200,
    'dashboard load time < 1s': (r) => r.timings.duration < 1000,
  });

  // Test reader listing
  const readersRes = http.get('https://api.soulseer.com/readers', {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  check(readersRes, {
    'readers status is 200': (r) => r.status === 200,
    'readers load time < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(1);
}
```

### 2. Stress Testing

```typescript
// tests/performance/stress-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '3m', target: 500 },  // Ramp up to 500 users
    { duration: '5m', target: 1000 }, // Ramp up to 1000 users
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(99)<2000'], // 99% of requests should be below 2s
    http_req_failed: ['rate<0.05'],   // Less than 5% of requests should fail
  },
};

export default function () {
  // Simulate concurrent session bookings
  const sessionRes = http.post('https://api.soulseer.com/sessions/book', JSON.stringify({
    readerId: 'test-reader-123',
    sessionType: 'chat',
    scheduledAt: new Date(Date.now() + 3600000).toISOString(),
  }), {
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.TOKEN}`,
    },
  });

  check(sessionRes, {
    'session booking status is 200 or 409': (r) => r.status === 200 || r.status === 409,
  });

  sleep(0.5);
}
```

### 3. WebRTC Performance Testing

```typescript
// tests/performance/webrtc-test.js
import { chromium } from 'playwright';
import { performance } from 'perf_hooks';

async function testWebRTCPerformance() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Start performance monitoring
  const startTime = performance.now();

  // Navigate to session
  await page.goto('/session/test-session-123');
  
  // Join session
  await page.click('[data-testid="join-session"]');
  
  // Wait for connection
  await page.waitForSelector('[data-testid="connection-status"]', { state: 'visible' });
  
  // Measure connection time
  const connectionTime = performance.now() - startTime;
  console.log(`Connection time: ${connectionTime}ms`);

  // Monitor video quality
  const videoStats = await page.evaluate(() => {
    const video = document.querySelector('[data-testid="remote-video"]');
    if (!video) return null;
    
    return {
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      readyState: video.readyState,
    };
  });

  console.log('Video stats:', videoStats);

  // Test data channel performance
  const dataChannelTestStart = performance.now();
  
  // Send test messages
  for (let i = 0; i < 100; i++) {
    await page.fill('[data-testid="chat-input"]', `Test message ${i}`);
    await page.click('[data-testid="send-message"]');
    await page.waitForTimeout(10);
  }
  
  const dataChannelTime = performance.now() - dataChannelTestStart;
  console.log(`Data channel test time: ${dataChannelTime}ms`);

  await browser.close();
  
  return {
    connectionTime,
    videoStats,
    dataChannelTime,
  };
}

// Run the test
testWebRTCPerformance().then((results) => {
  console.log('WebRTC Performance Test Results:', results);
});
```

## Security Testing Strategy

### 1. Authentication Security Testing

```typescript
// tests/security/auth-security.test.ts
import request from 'supertest';
import { app } from '@/app';
import { prisma } from '@/lib/db';

describe('Authentication Security', () => {
  test('prevents brute force attacks', async () => {
    const attempts = 10;
    const promises = [];
    
    for (let i = 0; i < attempts; i++) {
      promises.push(
        request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword',
          })
      );
    }
    
    const responses = await Promise.all(promises);
    
    // Check if rate limiting is working
    const blockedResponses = responses.filter(res => res.status === 429);
    expect(blockedResponses.length).toBeGreaterThan(0);
  });

  test('validates session tokens', async () => {
    // Test with invalid token
    const response = await request(app)
      .get('/api/user/profile')
      .set('Authorization', 'Bearer invalid-token');
    
    expect(response.status).toBe(401);
  });

  test('handles session expiration', async () => {
    // Create expired session
    const expiredToken = 'expired-jwt-token';
    
    const response = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${expiredToken}`);
    
    expect(response.status).toBe(401);
  });
});
```

### 2. Input Validation Testing

```typescript
// tests/security/input-validation.test.ts
import request from 'supertest';
import { app } from '@/app';

describe('Input Validation Security', () => {
  test('prevents SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: maliciousInput,
        password: 'password123',
      });
    
    expect(response.status).toBe(400);
  });

  test('prevents XSS attacks', async () => {
    const xssPayload = '<script>alert("xss")</script>';
    
    const response = await request(app)
      .post('/api/users/profile')
      .send({
        bio: xssPayload,
      })
      .set('Authorization', 'Bearer valid-token');
    
    expect(response.status).toBe(400);
  });

  test('validates file uploads', async () => {
    // Test with malicious file
    const response = await request(app)
      .post('/api/upload/avatar')
      .attach('file', Buffer.from('malicious content'), {
        filename: 'malicious.exe',
        contentType: 'application/x-msdownload',
      })
      .set('Authorization', 'Bearer valid-token');
    
    expect(response.status).toBe(400);
  });
});
```

### 3. API Security Testing

```typescript
// tests/security/api-security.test.ts
import request from 'supertest';
import { app } from '@/app';

describe('API Security', () => {
  test('enforces rate limiting', async () => {
    const requests = [];
    const limit = 100; // Adjust based on your rate limit
    
    for (let i = 0; i < limit + 10; i++) {
      requests.push(
        request(app)
          .get('/api/readers')
          .set('User-Agent', `test-${i}`)
      );
    }
    
    const responses = await Promise.all(requests);
    const blockedResponses = responses.filter(res => res.status === 429);
    
    expect(blockedResponses.length).toBeGreaterThan(0);
  });

  test('validates CORS headers', async () => {
    const response = await request(app)
      .options('/api/auth/login')
      .set('Origin', 'https://malicious.com');
    
    expect(response.headers['access-control-allow-origin']).not.toBe('https://malicious.com');
  });

  test('protects sensitive endpoints', async () => {
    const sensitiveEndpoints = [
      '/api/admin/users',
      '/api/admin/financials',
      '/api/users/sensitive-data',
    ];
    
    for (const endpoint of sensitiveEndpoints) {
      const response = await request(app).get(endpoint);
      expect(response.status).toBe(401);
    }
  });
});
```

## Accessibility Testing Strategy

### 1. Automated Accessibility Testing

```typescript
// tests/accessibility/automated.test.ts
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';
import { HomePage } from '@/app/page';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  test('home page should have no accessibility violations', async () => {
    const { container } = render(<HomePage />);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });

  test('login form should be accessible', async () => {
    const { container } = render(<LoginForm />);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });

  test('reader cards should be accessible', async () => {
    const { container } = render(<ReaderCard reader={mockReader} />);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });
});
```

### 2. Keyboard Navigation Testing

```typescript
// tests/accessibility/keyboard-navigation.test.ts
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from '@/components/auth/LoginForm';

describe('Keyboard Navigation', () => {
  test('login form can be navigated with keyboard', () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Tab through form fields
    fireEvent.tab(document);
    expect(document.activeElement).toBe(emailInput);
    
    fireEvent.tab(document);
    expect(document.activeElement).toBe(passwordInput);
    
    fireEvent.tab(document);
    expect(document.activeElement).toBe(submitButton);
    
    // Submit form with Enter key
    fireEvent.keyDown(submitButton, { key: 'Enter' });
    // Verify form submission logic
  });

  test('navigation menu is keyboard accessible', () => {
    render(<Navigation />);
    
    const navLinks = screen.getAllByRole('link');
    
    // Test arrow key navigation
    fireEvent.keyDown(navLinks[0], { key: 'ArrowDown' });
    expect(document.activeElement).toBe(navLinks[1]);
    
    // Test Enter key activation
    fireEvent.keyDown(navLinks[0], { key: 'Enter' });
    // Verify navigation logic
  });
});
```

### 3. Screen Reader Testing

```typescript
// tests/accessibility/screen-reader.test.ts
import { render, screen } from '@testing-library/react';
import { ReaderCard } from '@/components/client/ReaderCard';

describe('Screen Reader Support', () => {
  test('reader card has proper ARIA labels', () => {
    const mockReader = {
      id: '1',
      firstName: 'Jane',
      lastName: 'Doe',
      specialties: ['tarot', 'astrology'],
      averageRating: 4.5,
      status: 'online',
    };
    
    render(<ReaderCard reader={mockReader} />);
    
    // Check for proper ARIA labels
    expect(screen.getByLabelText(/Jane Doe, reader/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/4.5 stars/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/online status/i)).toBeInTheDocument();
  });

  test('form fields have proper labels and descriptions', () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    expect(emailInput).toHaveAttribute('aria-describedby', 'email-description');
    expect(passwordInput).toHaveAttribute('aria-describedby', 'password-description');
    
    expect(screen.getByText(/enter your email address/i)).toBeInTheDocument();
    expect(screen.getByText(/enter your password/i)).toBeInTheDocument();
  });
});
```

## Test Data Management

### 1. Test Data Factory

```typescript
// tests/factories/index.ts
import { Factory } from 'fishery';
import { prisma } from '@/lib/db';

// User Factory
export const userFactory = Factory.define<User>(({ sequence }) => ({
  id: `user-${sequence}`,
  email: `user-${sequence}@example.com`,
  username: `user${sequence}`,
  passwordHash: 'hashed_password',
  role: 'CLIENT',
  createdAt: new Date(),
  updatedAt: new Date(),
}));

// Client Profile Factory
export const clientProfileFactory = Factory.define<ClientProfile>(({ sequence }) => ({
  id: `client-${sequence}`,
  userId: `user-${sequence}`,
  firstName: 'Test',
  lastName: 'Client',
  bio: 'Test client',
  createdAt: new Date(),
  updatedAt: new Date(),
}));

// Reader Profile Factory
export const readerProfileFactory = Factory.define<ReaderProfile>(({ sequence }) => ({
  id: `reader-${sequence}`,
  userId: `user-${sequence}`,
  firstName: 'Test',
  lastName: 'Reader',
  bio: 'Test reader',
  specialties: ['tarot', 'astrology'],
  experience: 5,
  pricing: { chat: 2.50, call: 3.00, video: 4.00 },
  status: 'online',
  createdAt: new Date(),
  updatedAt: new Date(),
}));

// Session Factory
export const sessionFactory = Factory.define<Session>(({ sequence }) => ({
  id: `session-${sequence}`,
  sessionId: `session-${sequence}`,
  clientId: 'user-1',
  readerId: 'user-2',
  type: 'chat',
  status: 'SCHEDULED',
  readerRate: 2.50,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

// Helper functions
export const createTestUser = async (overrides = {}) => {
  const userData = userFactory.build(overrides);
  return await prisma.user.create({ data: userData });
};

export const createTestClient = async (userOverrides = {}, clientOverrides = {}) => {
  const user = await createTestUser({ ...userOverrides, role: 'CLIENT' });
  const clientData = clientProfileFactory.build({ ...clientOverrides, userId: user.id });
  const client = await prisma.clientProfile.create({ data: clientData });
  return { user, client };
};

export const createTestReader = async (userOverrides = {}, readerOverrides = {}) => {
  const user = await createTestUser({ ...userOverrides, role: 'READER' });
  const readerData = readerProfileFactory.build({ ...readerOverrides, userId: user.id });
  const reader = await prisma.readerProfile.create({ data: readerData });
  return { user, reader };
};
```

### 2. Test Data Cleanup

```typescript
// tests/setup/cleanup.ts
import { prisma } from '@/lib/db';

export const cleanupTestData = async () => {
  // Clean up in reverse order of dependencies
  await prisma.gift.deleteMany();
  await prisma.message.deleteMany();
  await prisma.forumReply.deleteMany();
  await prisma.forumPost.deleteMany();
  await prisma.liveStream.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.review.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.session.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.readerProfile.deleteMany();
  await prisma.clientProfile.deleteMany();
  await prisma.adminProfile.deleteMany();
  await prisma.user.deleteMany();
};

export const cleanupTestUsers = async () => {
  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { contains: '@example.com' } },
        { username: { startsWith: 'test' } },
        { username: { startsWith: 'user-' } },
      ],
    },
  });
};
```

## CI/CD Integration

### 1. GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Set up environment variables
      run: |
        echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/soulseer_test" >> $GITHUB_ENV
        echo "NEXTAUTH_SECRET=test-secret" >> $GITHUB_ENV
        echo "NEXTAUTH_URL=http://localhost:3000" >> $GITHUB_ENV
    
    - name: Run database migrations
      run: npm run db:migrate
    
    - name: Run unit tests
      run: npm run test:unit
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Run security tests
      run: npm run test:security
    
    - name: Run accessibility tests
      run: npm run test:accessibility
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella
        fail_ci_if_error: true

  performance:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install k6
      run: |
        curl https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-linux-amd64.tar.gz -L | tar xvz --strip-components 1
        sudo mv k6 /usr/local/bin/
    
    - name: Run load tests
      run: npm run test:load
    
    - name: Run stress tests
      run: npm run test:stress
```

### 2. Test Scripts Configuration

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=tests/(unit|components)",
    "test:integration": "jest --testPathPattern=tests/integration",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:security": "jest --testPathPattern=tests/security",
    "test:accessibility": "jest --testPathPattern=tests/accessibility",
    "test:load": "k6 run tests/performance/load-test.js",
    "test:stress": "k6 run tests/performance/stress-test.js",
    "test:performance": "node tests/performance/webrtc-test.js",
    "test:ci": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "typecheck": "tsc --noEmit"
  }
}
```

## Test Reporting and Metrics

### 1. Test Report Configuration

```typescript
// jest.config.ts
export default {
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true,
      },
    ],
    [
      'jest-html-reporter',
      {
        pageTitle: 'SoulSeer Test Report',
        outputPath: 'test-results/test-report.html',
        includeFailureMsg: true,
        includeSuiteFailure: true,
      },
    ],
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'clover',
    'html',
  ],
};
```

### 2. Performance Metrics Collection

```typescript
// tests/utils/performance-metrics.ts
export interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkRequests: number;
  errors: number;
}

export class PerformanceCollector {
  private metrics: PerformanceMetrics[] = [];
  
  collectMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);
  }
  
  getAverageResponseTime(): number {
    const total = this.metrics.reduce((sum, m) => sum + m.responseTime, 0);
    return total / this.metrics.length;
  }
  
  getAverageMemoryUsage(): number {
    const total = this.metrics.reduce((sum, m) => sum + m.memoryUsage, 0);
    return total / this.metrics.length;
  }
  
  getErrorRate(): number {
    const totalErrors = this.metrics.reduce((sum, m) => sum + m.errors, 0);
    const totalRequests = this.metrics.reduce((sum, m) => sum + m.networkRequests, 0);
    return totalErrors / totalRequests;
  }
  
  generateReport(): string {
    return `
      Performance Test Report
      ========================
      
      Average Response Time: ${this.getAverageResponseTime()}ms
      Average Memory Usage: ${this.getAverageMemoryUsage()}MB
      Error Rate: ${(this.getErrorRate() * 100).toFixed(2)}%
      
      Total Tests Run: ${this.metrics.length}
    `;
  }
}
```

This comprehensive testing plan ensures that the SoulSeer platform is thoroughly tested across all dimensions - functionality, performance, security, and accessibility - providing confidence in the platform's reliability and quality.