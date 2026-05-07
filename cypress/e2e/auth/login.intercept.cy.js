const LOGIN_URL = "/web/index.php/auth/login";
const DASHBOARD = "/dashboard";
const EMPLOYEE = "/web/index.php/pim/viewEmployeeList";

const API = {
  dashboard: "/web/index.php/api/v2/dashboard/employees/action-summary",
  empList: "/web/index.php/api/v2/pim/employees*",
};

const SEL = {
  username: '[name="username"]',
  password: '[name="password"]',
  submitBtn: '[type="submit"]',
  errorMsg: ".oxd-alert-content-text",
  requiredMsg: ".oxd-input-field-error-message",
  topbarHeader: ".oxd-topbar-header-breadcrumb",
};

beforeEach(() => {
  cy.visit(LOGIN_URL);
});

describe("OrangeHRM | Login - cy.intercept() Tests", () => {
  it("[TC_001] Login with valid username & password - dashboard API must respond with 200", () => {
    cy.intercept("GET", API.dashboard).as("actionSummary");

    cy.login("Admin", "admin123");

    cy.wait("@actionSummary").its("response.statusCode").should("eq", 200);

    cy.url().should("include", DASHBOARD);
    cy.get(SEL.topbarHeader).should("be.visible");
  });

  it("[TC_002] Login with wrong password - page not redirected & dashboard API not called", () => {
    cy.intercept("GET", API.dashboard).as("actionSummary");

    cy.login("Admin", "wrongpass");

    cy.get(SEL.errorMsg)
      .should("be.visible")
      .and("contain.text", "Invalid credentials");

    cy.url().should("include", LOGIN_URL);
    cy.get("@actionSummary.all").should("have.length", 0);
  });

  it("[TC_003] Login with unregistered username - POST request sent to server & error message appears", () => {
    cy.intercept("GET", API.dashboard).as("actionSummary");

    cy.login("randomuser", "admin123");

    cy.get(SEL.errorMsg)
      .should("be.visible")
      .and("contain.text", "Invalid credentials");

    cy.url().should("include", LOGIN_URL);
    cy.get("@actionSummary.all").should("have.length", 0);
  });

  it('[TC_004] Login with empty password - client-side validation stops request & shows "Required"', () => {
    cy.intercept("POST", "**/auth/login").as("loginPost");

    cy.login("Admin", "");

    cy.get("@loginPost.all").should("have.length", 0);

    cy.get(SEL.requiredMsg)
      .should("be.visible")
      .and("contain.text", "Required");
  });

  it('[TC_005] Login with empty username & password - client-side validation stops request & shows "Required"', () => {
    cy.intercept("POST", "**/auth/login").as("loginPost");

    cy.get(SEL.submitBtn).click();

    cy.get("@loginPost.all").should("have.length", 0);

    cy.get(SEL.requiredMsg)
      .should("have.length.at.least", 2)
      .each(($el) => {
        cy.wrap($el).should("contain.text", "Required");
      });
  });

  it("[TC_007] Login with lowercase username - dashboard API responds with 200 (case-insensitive)", () => {
    cy.intercept("GET", API.dashboard).as("actionSummary");

    cy.login("admin", "admin123");

    cy.wait("@actionSummary").its("response.statusCode").should("eq", 200);

    cy.url().should("include", DASHBOARD);
  });

  it('[TC_008] Login with username containing leading and trailing spaces - should display "Invalid credentials"', () => {
    cy.intercept("GET", API.dashboard).as("actionSummary");

    cy.login(" Admin ", "admin123");
    cy.get("@actionSummary.all").should("have.length", 0);

    cy.get(SEL.errorMsg)
      .should("be.visible")
      .and("contain.text", "Invalid credentials");

    cy.url().should("include", LOGIN_URL);
  });

  it("[TC_009] SQL Injection in username - payload sent to server & login not bypassed", () => {
    cy.intercept("POST", "**/auth/login").as("loginPost");

    cy.login("' OR '1'='1", "admin123");

    cy.get(SEL.errorMsg)
      .should("be.visible")
      .and("contain.text", "Invalid credentials");

    cy.url().should("include", LOGIN_URL);
    cy.get("@loginPost.all").should("have.length", 0);
  });

  it("[TC_010] SQL Injection in password - payload sent to server & login not bypassed", () => {
    cy.intercept("POST", "**/auth/login").as("loginPost");

    cy.login("Admin", "' OR '1'='1");

    cy.get(SEL.errorMsg)
      .should("be.visible")
      .and("contain.text", "Invalid credentials");

    cy.url().should("include", LOGIN_URL);
    cy.get("@loginPost.all").should("have.length", 0);
  });

  it("[TC_011] XSS payload in username - script not executed & login fails", () => {
    // Catch if alert() is triggered → means XSS succeeded
    cy.on("window:alert", () => {
      throw new Error("XSS DETECTED: alert() triggered in browser!");
    });

    cy.intercept("POST", "**/auth/login").as("loginPost");

    cy.login("<script>alert('xss')</script>", "admin123");

    cy.get("@loginPost.all").should("have.length", 0);
    cy.get(SEL.errorMsg)
      .should("be.visible")
      .and("contain.text", "Invalid credentials");
  });

  it("[TC_018] Login using Enter key - dashboard API responds with 200", () => {
    cy.intercept("GET", API.dashboard).as("actionSummary");

    cy.get(SEL.username).type("Admin");
    cy.get(SEL.password).type("admin123").type("{enter}");

    cy.wait("@actionSummary").its("response.statusCode").should("eq", 200);

    cy.url().should("include", DASHBOARD);
    cy.get(SEL.topbarHeader).should("be.visible");
  });

  it("[TC_021] Active session - navigate to Employee List calls employees API with status 200", () => {
    cy.intercept("GET", API.dashboard).as("actionSummary");
    cy.login("Admin", "admin123");
    cy.wait("@actionSummary").its("response.statusCode").should("eq", 200);

    cy.intercept("GET", API.empList).as("empListApi");
    cy.visit(EMPLOYEE);

    cy.wait("@empListApi").its("response.statusCode").should("eq", 200);

    cy.url().should("include", EMPLOYEE);
    cy.get(SEL.topbarHeader).should("be.visible");
  });

  it("[TC_022] Stub dashboard API - response 500 does not crash the page", () => {
    cy.intercept("GET", API.dashboard, {
      statusCode: 500,
      body: { error: "Internal Server Error" },
    }).as("dashboardStub");

    cy.login("Admin", "admin123");

    cy.wait("@dashboardStub").its("response.statusCode").should("eq", 500);

    cy.url().should("include", DASHBOARD);
  });
});
