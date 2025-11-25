# Testing Guide: Soulmates Application

**Comprehensive testing strategy and examples**

---

## Testing Strategy

### Test Pyramid

```
        /\
       /E2E\        ← Few, critical user journeys
      /------\
     /Integration\  ← API → Database flows
    /------------\
   /   Unit Tests  \ ← Many, fast, isolated
  /----------------\
```

---

## Unit Tests

### Backend Unit Tests

**File**: `web_app/backend/tests/test_profiles.py`

```python
import pytest
from fastapi.testclient import TestClient
from app import app
from database.connection import get_db
from database.soulmates_models import User, SoulProfile

client = TestClient(app)

def test_get_profile_success():
    """Test getting a user's profile"""
    # Setup: Create user and profile
    # ...
    
    response = client.get(
        "/api/v1/soulmates/profile",
        headers={"Authorization": "Bearer valid_token"}
    )
    
    assert response.status_code == 200
    assert "primary_archetype" in response.json()

def test_get_profile_not_found():
    """Test getting profile when none exists"""
    response = client.get(
        "/api/v1/soulmates/profile",
        headers={"Authorization": "Bearer valid_token"}
    )
    
    assert response.status_code == 404
```

**File**: `web_app/backend/tests/test_bonds.py`

```python
def test_create_bond_invite():
    """Test creating a bond invite"""
    response = client.post(
        "/api/v1/soulmates/bonds/invite",
        headers={"Authorization": "Bearer valid_token"},
        json={
            "to_email": "partner@example.com",
            "bond_type": "ROMANTIC"
        }
    )
    
    assert response.status_code == 200
    assert response.json()["success"] == True
    assert "invite" in response.json()
```

### Frontend Unit Tests

**File**: `apps/soulmates/__tests__/lib/auth.test.ts`

```typescript
import { getCurrentUserId, getCurrentUserEmail } from "@/lib/auth";

describe("Auth Utilities", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("getCurrentUserId returns null when no token", () => {
    expect(getCurrentUserId()).toBeNull();
  });

  test("getCurrentUserId extracts user ID from JWT", () => {
    // Mock JWT token
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyJ9.signature";
    localStorage.setItem("auth_token", token);
    
    expect(getCurrentUserId()).toBe("user_123");
  });
});
```

**File**: `apps/soulmates/__tests__/components/StoryQuest.test.tsx`

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import StoryQuest from "@/components/StoryQuest";

describe("StoryQuest Component", () => {
  test("renders first scenario", () => {
    render(<StoryQuest personNumber={1} onComplete={jest.fn()} />);
    
    expect(screen.getByText(/Your Love Story/i)).toBeInTheDocument();
    expect(screen.getByText(/Chapter 1/i)).toBeInTheDocument();
  });

  test("calls onComplete when finished", () => {
    const onComplete = jest.fn();
    render(<StoryQuest personNumber={1} onComplete={onComplete} />);
    
    // Simulate completing all scenarios
    // ...
    
    expect(onComplete).toHaveBeenCalled();
  });
});
```

---

## Integration Tests

### API → Database Integration

**File**: `web_app/backend/tests/integration/test_profile_flow.py`

```python
def test_profile_creation_flow():
    """Test complete profile creation flow"""
    # 1. Create user (via auth)
    user = create_test_user()
    
    # 2. Create profile
    response = client.post(
        "/api/v1/soulmates/profile",
        headers={"Authorization": f"Bearer {user.token}"},
        json={
            "primary_archetype": "Secure",
            "attachment_style": "Secure",
            "love_languages": ["Words", "Touch"]
        }
    )
    
    assert response.status_code == 200
    
    # 3. Verify in database
    profile = db.query(SoulProfile).filter(
        SoulProfile.user_id == user.id
    ).first()
    
    assert profile is not None
    assert profile.primary_archetype == "Secure"
```

**File**: `web_app/backend/tests/integration/test_bond_flow.py`

```python
def test_bond_lifecycle():
    """Test complete bond lifecycle"""
    user_a = create_test_user("user_a@test.com")
    user_b = create_test_user("user_b@test.com")
    
    # 1. Create invite
    invite_response = client.post(
        "/api/v1/soulmates/bonds/invite",
        headers={"Authorization": f"Bearer {user_a.token}"},
        json={"to_user_id": str(user_b.id), "bond_type": "ROMANTIC"}
    )
    invite_id = invite_response.json()["invite"]["id"]
    
    # 2. Accept invite
    accept_response = client.post(
        "/api/v1/soulmates/bonds/accept",
        headers={"Authorization": f"Bearer {user_b.token}"},
        json={"invite_id": invite_id}
    )
    
    assert accept_response.status_code == 200
    bond_id = accept_response.json()["bond"]["id"]
    
    # 3. Verify bond exists
    bond = db.query(RelationshipBond).filter(
        RelationshipBond.id == bond_id
    ).first()
    
    assert bond.status == BondStatus.ACTIVE
    
    # 4. End bond
    end_response = client.post(
        "/api/v1/soulmates/bonds/end",
        headers={"Authorization": f"Bearer {user_a.token}"},
        json={"bond_id": bond_id}
    )
    
    assert end_response.status_code == 200
    
    # 5. Verify bond is ended (not deleted)
    bond = db.query(RelationshipBond).filter(
        RelationshipBond.id == bond_id
    ).first()
    
    assert bond.status == BondStatus.ENDED
    assert bond.ended_at is not None
```

---

## E2E Tests

### Playwright E2E Tests

**File**: `apps/soulmates/e2e/onboarding.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Onboarding Flow", () => {
  test("complete onboarding journey", async ({ page }) => {
    // 1. Navigate to onboarding
    await page.goto("http://localhost:3000/onboarding");
    
    // 2. Verify StoryQuest is displayed
    await expect(page.getByText(/Your Love Story/i)).toBeVisible();
    
    // 3. Complete scenarios (simplified - in real test, complete all 32)
    for (let i = 0; i < 5; i++) {
      await page.click("button:has-text('High security')");
      await page.click("button:has-text('Next')");
    }
    
    // 4. Submit
    await page.click("button:has-text('Complete')");
    
    // 5. Verify redirect to dashboard
    await expect(page).toHaveURL(/\/me/);
    await expect(page.getByText(/My Dashboard/i)).toBeVisible();
  });
});
```

**File**: `apps/soulmates/e2e/bonds.spec.ts`

```typescript
test.describe("Bonds Flow", () => {
  test("create and manage bond", async ({ page }) => {
    // 1. Login (if needed)
    await page.goto("http://localhost:3000");
    // ... login steps
    
    // 2. Navigate to bonds
    await page.click("text=Bonds");
    await expect(page).toHaveURL(/\/bonds/);
    
    // 3. Create invite
    await page.click("button:has-text('Invite Partner')");
    await page.fill("input[type='email']", "partner@test.com");
    await page.click("button:has-text('Send Invite')");
    
    // 4. Verify success message
    await expect(page.getByText(/Invite sent/i)).toBeVisible();
  });
});
```

---

## Test Setup

### Backend Test Setup

**File**: `web_app/backend/pytest.ini`

```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short
```

**File**: `web_app/backend/tests/conftest.py`

```python
import pytest
from fastapi.testclient import TestClient
from app import app
from database.connection import get_db, Base, engine
from sqlalchemy.orm import Session

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def db_session():
    """Create a test database session"""
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    yield db
    Base.metadata.drop_all(bind=engine)
    db.close()
```

### Frontend Test Setup

**File**: `apps/soulmates/jest.config.js`

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
```

**File**: `apps/soulmates/jest.setup.js`

```javascript
// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;
```

---

## Running Tests

### Backend Tests

```bash
cd web_app/backend

# Run all tests
pytest

# Run specific test file
pytest tests/test_profiles.py

# Run with coverage
pytest --cov=. --cov-report=html

# Run in watch mode (requires pytest-watch)
ptw
```

### Frontend Tests

```bash
cd apps/soulmates

# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

### E2E Tests

```bash
cd apps/soulmates

# Install Playwright
npx playwright install

# Run E2E tests
npx playwright test

# Run in UI mode
npx playwright test --ui

# Run specific test
npx playwright test e2e/onboarding.spec.ts
```

---

## Test Coverage Goals

### Minimum Coverage

- **Backend**: 70%+ coverage
- **Frontend**: 60%+ coverage
- **Critical Paths**: 90%+ coverage

### Critical Paths to Test

1. ✅ Onboarding → Profile creation
2. ✅ Bond invite → Accept → View
3. ✅ Compatibility explorer → Results display
4. ✅ Journaling → Create entry → View
5. ✅ Error handling → Network failures
6. ✅ Auth → Token validation → Unauthorized

---

## Continuous Integration

### GitHub Actions

**File**: `.github/workflows/test.yml`

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: |
          cd web_app/backend
          pip install -r requirements.txt
          pip install pytest pytest-cov
          pytest --cov=. --cov-report=xml
      - uses: codecov/codecov-action@v3

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: |
          cd apps/soulmates
          npm ci
          npm test -- --coverage
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: |
          cd apps/soulmates
          npm ci
          npx playwright install
          npx playwright test
```

---

## Manual Testing Checklist

### Phase 0: Solo Self-Discovery

- [ ] Complete onboarding (StoryQuest)
- [ ] View dashboard (`/me`)
- [ ] Create journal entry
- [ ] View journal entries
- [ ] Verify profile data displays

### Phase 1: Compatibility Explorer

- [ ] Navigate to `/explore`
- [ ] Select archetypal partner
- [ ] View compatibility results
- [ ] Verify score breakdown displays
- [ ] Check astrology/numerology indicators

### Phase 2: Couple Mode

- [ ] Create bond invite
- [ ] Accept bond invite (if possible)
- [ ] View bond dashboard
- [ ] View compatibility in bond
- [ ] Create shared journal entry
- [ ] End bond
- [ ] Verify bond is ended (not deleted)

### Phase 3: Resonance Lab

- [ ] View solo lab (`/lab`)
- [ ] Change time window
- [ ] View couple lab (`/bond/[id]/lab`)
- [ ] Verify metrics display
- [ ] Check correlation patterns

### Error Scenarios

- [ ] Backend offline → Error message displays
- [ ] Invalid token → Redirect to login
- [ ] Network timeout → Retry option
- [ ] 404 errors → Friendly error page

---

## Performance Testing

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:8000/health

# Using k6
k6 run load_test.js
```

**File**: `load_test.js`

```javascript
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  let res = http.get('http://localhost:8000/api/v1/soulmates/bonds');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

---

## Next Steps

1. ✅ Set up test infrastructure
2. ⏳ Write critical path tests
3. ⏳ Add CI/CD integration
4. ⏳ Set up test coverage reporting
5. ⏳ Add performance benchmarks

---

**Status**: Testing framework ready, examples provided

