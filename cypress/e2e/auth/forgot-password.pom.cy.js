import ForgotPasswordPage from "../../pages/ForgotPasswordPage";

describe("OrangeHRM | Forgot Password Feature - POM Tests", () => {
  let data;
  let forgotPage;

  beforeEach(() => {
    cy.fixture("forgotPassword").then((fixture) => {
      data = fixture;
      forgotPage = new ForgotPasswordPage(fixture.selectors);
      forgotPage.visitLogin();
    });
  });

  describe("1. Navigation", () => {
    it('[AUTH-FPASS-001] Clicking "Forgot your password?" link from login page should navigate to Reset Password page', () => {
      forgotPage.navigateViaLink();

      cy.url().should("include", data.urls.forgotPassword);
      forgotPage.getPageTitle().should("contain.text", "Reset Password");
    });

    it("[AUTH-FPASS-002] Direct URL access to Forgot Password page should load correctly", () => {
      forgotPage.visitForgotPassword();

      cy.url().should("include", data.urls.forgotPassword);
      forgotPage.getPageTitle().should("contain.text", "Reset Password");
    });

    it("[AUTH-FPASS-003] Cancel button on Forgot Password page should redirect back to Login page", () => {
      forgotPage.visitForgotPassword();
      forgotPage.clickCancel();

      cy.url().should("include", data.urls.login);
    });
  });

  describe("2. Form Submission", () => {
    // it('[AUTH-FPASS-001] Submit with registered username — should show "Reset Password link sent" confirmation page', () => {
    //   forgotPage.visitForgotPassword();
    //   forgotPage.fillUsername(data.validUsername);
    //   forgotPage.submitForm();

    //   cy.url().should("include", data.urls.checkEmail);
    // });

    it("[AUTH-FPASS-004] Submit with unregistered username — system should still show success page (no user enumeration)", () => {
      forgotPage.visitForgotPassword();
      forgotPage.fillUsername(data.invalidUsername);
      forgotPage.submitForm();

      cy.url().should("include", data.urls.checkEmail);
      forgotPage
        .getSuccessTitle()
        .should("contain.text", "Reset Password link sent successfully");
    });

    it('[AUTH-FPASS-005] Submit with empty username — should show "Required" validation message', () => {
      forgotPage.visitForgotPassword();
      forgotPage.submitForm();

      forgotPage
        .getRequiredMessages()
        .first()
        .should("be.visible")
        .and("contain.text", "Required");
    });
  });

  describe("3. UI Elements", () => {
    it("[AUTH-FPASS-006] Username field should be visible, enabled, and editable on Forgot Password page", () => {
      forgotPage.visitForgotPassword();

      forgotPage
        .getUsernameInput()
        .should("be.visible")
        .and("not.be.disabled")
        .type("test")
        .should("have.value", "test");
    });

    it("[AUTH-FPASS-007] Submit button should be visible and clickable on Forgot Password page", () => {
      forgotPage.visitForgotPassword();

      forgotPage.getSubmitButton().should("be.visible").and("not.be.disabled");
    });

    it("[AUTH-FPASS-008] Cancel button should be visible and clickable on Forgot Password page", () => {
      forgotPage.visitForgotPassword();

      forgotPage.getCancelButton().should("be.visible").and("not.be.disabled");
    });

    it("[AUTH-FPASS-011] Forgot Password page should display page title, username field, submit, and cancel button", () => {
      forgotPage.visitForgotPassword();

      forgotPage
        .getPageTitle()
        .should("be.visible")
        .and("contain.text", "Reset Password");
      forgotPage.getUsernameInput().should("be.visible");
      forgotPage.getSubmitButton().should("be.visible");
      forgotPage.getCancelButton().should("be.visible");
    });

    it('[AUTH-FPASS-012] Page title on Forgot Password page should read "Reset Password"', () => {
      forgotPage.visitForgotPassword();

      forgotPage
        .getPageTitle()
        .invoke("text")
        .should("match", /Reset Password/i);
    });
  });

  describe("4. Security", () => {
    it("[AUTH-FPASS-009] XSS payload in username field — script should not execute", () => {
      cy.on("window:alert", () => {
        throw new Error(
          "XSS DETECTED: alert() triggered on Forgot Password page!",
        );
      });

      forgotPage.visitForgotPassword();
      forgotPage.fillUsername(data.xssPayload);
      forgotPage.submitForm();

      cy.url().should("not.include", data.urls.login);
    });

    it("[AUTH-FPASS-010] SQL injection in username field — should not expose server error", () => {
      forgotPage.visitForgotPassword();
      forgotPage.fillUsername(data.sqlPayload);
      forgotPage.submitForm();

      cy.get("body").should("not.contain.text", "SQL");
      cy.get("body").should("not.contain.text", "syntax error");
    });
  });
});