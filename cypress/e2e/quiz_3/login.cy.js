const LOGIN_URL = "/web/index.php/auth/login";
const DASHBOARD = "/dashboard";
const RESET_PAGE = "/requestPasswordResetCode";
const EMPLOYEE = "/web/index.php/pim/viewEmployeeList";

const SEL = {
  username: '[name="username"]',
  password: '[name="password"]',
  submitBtn: '[type="submit"]',
  errorMsg: ".oxd-alert-content-text",
  requiredMsg: ".oxd-input-field-error-message",
  forgotLink: ".orangehrm-login-forgot > p",
  topbarHeader: ".oxd-topbar-header-breadcrumb",
};

beforeEach(() => {
  cy.visit(LOGIN_URL);
});

describe("OrangeHRM | Login Feature", () => {
  describe("1. Positive Cases", () => {
    it("[TC_001] Login with valid username and valid password - should redirect to dashboard", () => {
      cy.login("Admin", "admin123");

      cy.url().should("include", DASHBOARD);
      cy.get(SEL.topbarHeader).should("be.visible");
    });

    it("[TC_007] Login with lowercase username - system should be case-insensitive", () => {
      cy.login("admin", "admin123");

      cy.url().should("include", DASHBOARD);
      cy.get(SEL.topbarHeader).should("be.visible");
    });

    it("[TC_018] Login by pressing Enter key instead of clicking the Login button - should redirect to dashboard", () => {
      cy.get(SEL.username).type("Admin");
      cy.get(SEL.password).type("admin123").type("{enter}");

      cy.url().should("include", DASHBOARD);
      cy.get(SEL.topbarHeader).should("be.visible");
    });

    it("[TC_021] User session should remain active after navigating to another page", () => {
      cy.login("Admin", "admin123");
      cy.url().should("include", DASHBOARD);

      cy.visit(EMPLOYEE);
      cy.url().should("include", EMPLOYEE);
      cy.get(SEL.topbarHeader).should("be.visible");
    });
  });

  describe("2. Negative Cases", () => {
    context("2a. Invalid Credentials", () => {
      it('[TC_002] Login with valid username and wrong password - should display "Invalid credentials"', () => {
        cy.login("Admin", "wrongpass");

        cy.get(SEL.errorMsg)
          .should("be.visible")
          .and("contain.text", "Invalid credentials");
      });

      it('[TC_003] Login with unregistered username and random password - should display "Invalid credentials"', () => {
        cy.login("randomuser", "randompass");

        cy.get(SEL.errorMsg)
          .should("be.visible")
          .and("contain.text", "Invalid credentials");
      });

      it('[TC_008] Login with username containing leading and trailing spaces - should display "Invalid credentials"', () => {
        cy.login(" Admin ", "admin123");

        cy.get(SEL.errorMsg)
          .should("be.visible")
          .and("contain.text", "Invalid credentials");
      });

      it('[TC_012] Login with username exceeding 100 characters - should display "Invalid credentials"', () => {
        cy.login("A".repeat(100), "admin123");

        cy.get(SEL.errorMsg)
          .should("be.visible")
          .and("contain.text", "Invalid credentials");
      });

      it('[TC_013] Login with password exceeding 100 characters - should display "Invalid credentials"', () => {
        cy.login("Admin", "a".repeat(100));

        cy.get(SEL.errorMsg)
          .should("be.visible")
          .and("contain.text", "Invalid credentials");
      });

      it('[TC_016] Login with special characters in the username field - should display "Invalid credentials"', () => {
        cy.login("Admin!@#$", "admin123");

        cy.get(SEL.errorMsg)
          .should("be.visible")
          .and("contain.text", "Invalid credentials");
      });

      it('[TC_017] Login with special characters in the password field - should display "Invalid credentials"', () => {
        cy.login("Admin", "!@#$%^&*()");

        cy.get(SEL.errorMsg)
          .should("be.visible")
          .and("contain.text", "Invalid credentials");
      });

      it('[TC_019] Login with numeric-only username - should display "Invalid credentials"', () => {
        cy.login("123456", "admin123");

        cy.get(SEL.errorMsg)
          .should("be.visible")
          .and("contain.text", "Invalid credentials");
      });

      it('[TC_020] Login with numeric-only password - should display "Invalid credentials"', () => {
        cy.login("Admin", "123456");

        cy.get(SEL.errorMsg)
          .should("be.visible")
          .and("contain.text", "Invalid credentials");
      });
    });

    context("2b. Required Field Validation", () => {
      it('[TC_004] Login with username filled but password empty - should show "Required" below the password field', () => {
        cy.get(SEL.username).type("Admin");
        cy.get(SEL.submitBtn).click();

        cy.get(SEL.requiredMsg)
          .first()
          .should("be.visible")
          .and("contain.text", "Required");
      });

      it('[TC_005] Login with password filled but username empty - should show "Required" below the username field', () => {
        cy.get(SEL.password).type("randompass");
        cy.get(SEL.submitBtn).click();

        cy.get(SEL.requiredMsg)
          .first()
          .should("be.visible")
          .and("contain.text", "Required");
      });

      it('[TC_006] Login with both username and password empty - should show "Required" under both fields', () => {
        cy.get(SEL.submitBtn).click();

        cy.get(SEL.requiredMsg)
          .should("have.length.at.least", 2)
          .each(($el) => cy.wrap($el).should("contain.text", "Required"));
      });
    });
  });

  describe("3. Security Cases", () => {
    it('[TC_009] SQL injection in the username field - should not bypass login and should display "Invalid credentials"', () => {
      cy.login("' OR '1'='1", "anything");

      cy.get(SEL.errorMsg)
        .should("be.visible")
        .and("contain.text", "Invalid credentials");
    });

    it('[TC_010] SQL injection in the password field - should not bypass login and should display "Invalid credentials"', () => {
      cy.login("Admin", "' OR '1'='1");

      cy.get(SEL.errorMsg)
        .should("be.visible")
        .and("contain.text", "Invalid credentials");
    });

    it('[TC_011] XSS payload in the username field - script should not execute and should display "Invalid credentials"', () => {
      cy.on("window:alert", () => {
        throw new Error("XSS vulnerability detected: alert() was triggered!");
      });

      cy.login("<script>alert('xss')</script>", "admin123");

      cy.get(SEL.errorMsg)
        .should("be.visible")
        .and("contain.text", "Invalid credentials");
    });
  });

  describe("4. UI / UX Cases", () => {
    it('[TC_014] Password field should mask input characters (type="password")', () => {
      cy.get(SEL.password)
        .should("have.attr", "type", "password")
        .type("admin123")
        .should("have.attr", "type", "password");
    });

    it('[TC_015] Clicking the "Forgot Password" link should redirect to the Reset Password page', () => {
      cy.get(SEL.forgotLink).should("be.visible").click();

      cy.url().should("include", RESET_PAGE);
      cy.contains("Reset Password").should("be.visible");
    });
  });
});
