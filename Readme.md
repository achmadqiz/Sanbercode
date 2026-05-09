# OrangeHRM & Platzi FakeAPI — Cypress Test Suite

An end-to-end and API test suite built with [Cypress](https://www.cypress.io/), covering the authentication flows of [OrangeHRM Live Demo](https://opensource-demo.orangehrmlive.com) and the Categories/Products CRUD API of [Platzi Fake Store API](https://api.escuelajs.co/api/v1).

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Test Architecture](#test-architecture)
- [Applications Under Test](#applications-under-test)
- [Custom Commands](#custom-commands)
- [Schema Validation](#schema-validation)
- [Fixtures](#fixtures)

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| Cypress | ^14.5.4 | Test runner |
| AJV | ^8.20.0 | JSON Schema validation |
| ajv-formats | ^3.0.1 | URI / format support for AJV |
| Node.js | >=18 | Runtime |

---

## Project Structure

```
cypress/
├── e2e/
│   ├── auth/
│   │   ├── forgot-password.intercept.cy.js   # Forgot Password — network layer tests
│   │   ├── forgot-password.pom.cy.js         # Forgot Password — POM tests
│   │   ├── login.intercept.cy.js             # Login — network layer tests
│   │   ├── login.pom.cy.js                   # Login — POM tests
│   │   └── login.ui.cy.js                    # Login — UI behaviour tests
│   ├── categories/
│   │   └── crud.api.cy.js                    # Categories CRUD API tests
│   └── dashboard/
│       ├── directory.intercept.cy.js         # Directory — network layer tests
│       └── directory.pom.cy.js               # Directory — POM tests
├── fixtures/
│   ├── categories.json                       # API test data & expected statuses
│   ├── directory.json                        # Directory selectors, URLs, mock data
│   ├── forgotPassword.json                   # Forgot Password selectors & payloads
│   └── login.json                            # Login selectors, credentials & payloads
├── pages/
│   ├── DirectoryPage.js                      # Page Object Model — Directory
│   ├── ForgotPasswordPage.js                 # Page Object Model — Forgot Password
│   └── LoginPage.js                          # Page Object Model — Login
├── schemas/
│   └── category-schema.js                    # JSON Schema definitions (category, product)
└── support/
    ├── api-commands.js                       # Custom API commands + AJV schema validation
    ├── commands.js                           # Global cy.login() command
    └── e2e.js                                # Support file entry point
cypress.config.js
package.json
```

---

## Getting Started

**1. Clone the repository**

```bash
git clone <your-repo-url>
cd <your-repo-folder>
```

**2. Install dependencies**

```bash
npm install
```

**3. Verify Cypress installation**

```bash
npx cypress verify
```

---

## Running Tests

**Open Cypress Test Runner (interactive)**

```bash
npx cypress open
```

**Run all tests headlessly (CI mode)**

```bash
npx cypress run
```

**Run a specific spec file**

```bash
npx cypress run --spec "cypress/e2e/auth/login.ui.cy.js"
```

**Run only API tests**

```bash
npx cypress run --spec "cypress/e2e/categories/crud.api.cy.js"
```

**Run all auth tests**

```bash
npx cypress run --spec "cypress/e2e/auth/**"
```

---

## Test Coverage

### Auth — Login (`login.ui.cy.js`, `login.pom.cy.js`, `login.intercept.cy.js`)

| Category | What is tested |
|---|---|
| Positive | Valid credentials, lowercase username (case-insensitivity), Enter key submission, session persistence |
| Negative — Invalid Credentials | Wrong password, unregistered username, leading/trailing spaces, username/password >100 chars, special characters, numeric-only inputs |
| Negative — Validation | Empty password, empty username, both fields empty |
| Security | SQL injection in username/password, XSS payload in username |
| UI / UX | Password field masking, Forgot Password link navigation |
| Resilience | Stubbed 500 dashboard API does not crash the page |
| Network | Dashboard API called on login, not called on failed login, Enter key triggers correct API |

### Auth — Forgot Password (`forgot-password.pom.cy.js`, `forgot-password.intercept.cy.js`)

| Category | What is tested |
|---|---|
| Navigation | Link from login navigates to Reset Password page, direct URL access, cancel redirects to login |
| Form Submission | Empty username shows Required, unregistered username shows success page (no user enumeration) |
| UI Elements | Username field visibility and editability, submit/cancel button states, page title |
| Security | XSS payload does not execute, SQL injection handled gracefully |
| Network | i18n messages API called on page load |

### Dashboard — Directory (`directory.pom.cy.js`, `directory.intercept.cy.js`)

| Category | What is tested |
|---|---|
| Navigation | Sidebar menu click, direct URL access, topbar breadcrumb |
| UI Elements | Search input, Search button, Reset button, employee cards on load, employee name display |
| Search — Positive | Typing in search input, partial name search, empty search returns all, Reset clears field and reloads |
| Search — Negative | Non-existent name returns zero cards |
| Security | XSS payload in search field, SQL injection in search field |
| Session & Access Control | Authenticated navigation without re-login, unauthenticated redirect to login |
| Network | Employee list API called on load and on search, employee detail API called on card click |
| Stubbed Responses | One employee stub, empty data stub, 500 error stub |

### Categories API (`crud.api.cy.js`)

| Test ID | Endpoint | What is tested |
|---|---|---|
| CAT-CRUD-001 | GET /categories | Returns list, schema valid |
| CAT-CRUD-002 | POST /categories | Creates new category, returns ID and slug |
| CAT-CRUD-003 | GET /categories/{id} | Returns correct category by dynamic ID |
| CAT-CRUD-004 | GET /categories/slug/{slug} | Returns category by slug |
| CAT-CRUD-005 | PUT /categories/{id} | Updates category by dynamic ID |
| CAT-CRUD-006 | DELETE /categories/{id} | Deletes category, verifies via GET |
| CAT-CRUD-007 | GET /categories/{id}/products | Returns products for a category |
| CAT-CRUD-008 | GET /categories/{invalidId} | Returns 400/404/500 for non-existent ID |
| CAT-CRUD-009 | GET /categories/slug/{invalidSlug} | Returns error for invalid slug |
| CAT-CRUD-010 | POST /categories | Rejects invalid category data |

---

## Test Architecture

### Three testing layers per feature

Each UI feature is covered in three complementary layers:

**`.ui.cy.js`** — pure UI/behaviour tests. No network assertions. Verifies what the user sees and can do.

**`.pom.cy.js`** — same scenarios driven through Page Object Models. Selectors and actions are abstracted, test data comes from fixtures.

**`.intercept.cy.js`** — network layer tests using `cy.intercept()`. Verifies which APIs are called, with what status codes, and validates response payloads.

### Page Object Model (POM)

Page Objects live in `cypress/pages/`. Each class receives selectors from its fixture file via the constructor, keeping selectors in one place.

```js
// Usage in tests
const loginPage = new LoginPage(data.selectors)
loginPage.login(username, password)
loginPage.getErrorMessage().should('contain.text', 'Invalid credentials')
```

### Session management

Authenticated tests use `cy.session()` to cache the login session across tests, avoiding repeated login round-trips:

```js
cy.session('admin-session', () => {
  cy.visit(fixture.urls.login)
  cy.login(fixture.credentials.username, fixture.credentials.password)
  cy.url().should('include', '/dashboard')
})
```

### Nested describe structure

All spec files use nested `describe` blocks to group tests by category, matching the structure of `login.ui.cy.js`:

```
describe("Feature")
  describe("1. Positive Cases")
  describe("2. Negative Cases")
    context("2a. Invalid Credentials")
    context("2b. Required Field Validation")
  describe("3. Security")
  describe("4. UI / UX")
```

---

## Applications Under Test

| Application | URL | Purpose |
|---|---|---|
| OrangeHRM Live Demo | https://opensource-demo.orangehrmlive.com | UI & E2E tests (Login, Forgot Password, Directory) |
| Platzi Fake Store API | https://api.escuelajs.co/api/v1 | API CRUD tests (Categories, Products) |

> **Note:** OrangeHRM Live Demo is a public shared server. Occasional 500 errors or slow responses are expected — they are server-side issues, not test failures.

---

## Custom Commands

Defined in `cypress/support/commands.js` and `cypress/support/api-commands.js`.

### UI Commands

| Command | Parameters | Description |
|---|---|---|
| `cy.login(username, password)` | `string, string` | Types credentials and clicks submit. Skips empty fields. |

### API Commands

| Command | Parameters | Description |
|---|---|---|
| `cy.apiGetCategories()` | — | GET /categories |
| `cy.apiGetCategoryById(id)` | `number` | GET /categories/{id} |
| `cy.apiGetCategoryBySlug(slug)` | `string` | GET /categories/slug/{slug} |
| `cy.apiCreateCategory(data)` | `object` | POST /categories |
| `cy.apiUpdateCategory(id, data)` | `number, object` | PUT /categories/{id} |
| `cy.apiDeleteCategory(id)` | `number` | DELETE /categories/{id} |
| `cy.apiGetProductsByCategory(id)` | `number` | GET /categories/{id}/products |

### Schema Validation Commands

| Command | Parameters | Description |
|---|---|---|
| `cy.validateCategorySchema(obj)` | `object` | Validates against JSON Schema using AJV. Throws with field-level errors on failure. |
| `cy.validateProductSchema(obj)` | `object` | Validates product object against JSON Schema. |

---

## Schema Validation

Schema definitions live in `cypress/schemas/category-schema.js` using standard JSON Schema format. AJV compiles them once at startup for performance.

```js
// category-schema.js
export const categorySchema = {
  type: 'object',
  required: ['id', 'name', 'slug', 'image'],
  properties: {
    id:    { type: 'integer', minimum: 1 },
    name:  { type: 'string', minLength: 1 },
    slug:  { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
    image: { type: 'string', format: 'uri' }
  }
}
```

When validation fails, AJV reports all broken fields at once:

```
Category schema failed:
data/slug must match pattern "^[a-z0-9]+(?:-[a-z0-9]+)*$"
data/image must match format "uri"
```

---

## Fixtures

All test data, selectors, URLs, and payloads are externalized into `cypress/fixtures/` so tests contain zero hardcoded strings.

| Fixture | Used by | Contains |
|---|---|---|
| `login.json` | login specs | Selectors, URLs, credentials, test payloads (SQL, XSS, long strings) |
| `forgotPassword.json` | forgot-password specs | Selectors, URLs, valid/invalid usernames, security payloads |
| `directory.json` | directory specs | Selectors, URLs, credentials, API patterns, mock employee data, search cases |
| `categories.json` | crud.api spec | Test category data, expected HTTP status codes, endpoint templates |