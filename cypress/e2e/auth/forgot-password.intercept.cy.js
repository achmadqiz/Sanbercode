const LOGIN_URL = "/web/index.php/auth/login";
const FORGOT_URL = "/web/index.php/auth/requestPasswordResetCode";
const CHECK_EMAIL_URL = "/web/index.php/auth/sendPasswordReset";

const SEL = {
    usernameInput: "[name='username']",
    submitBtn: "[type='submit']",
    cancelBtn: ".orangehrm-forgot-password-button--cancel",
    requiredMsg: ".oxd-input-field-error-message",
    title: "h6",
    forgotLink: ".orangehrm-login-forgot > p",
};

describe("OrangeHRM | Forgot Password - cy.intercept() Tests", () => {
    beforeEach(() => {
        cy.intercept("GET", "**/core/i18n/messages*").as("messages");
        cy.visit(LOGIN_URL);
    });

    describe("1. Navigation", () => {
        it("[AUTH-FPASS-001] Clicking forgot password link should navigate correctly", () => {
            cy.get(SEL.forgotLink).click();

            cy.url().should("include", FORGOT_URL);
            cy.get("@messages.all").should("have.length.at.least", 1);
            cy.get(SEL.title)
                .should("be.visible")
                .and("contain.text", "Reset Password");
        });

        it("[AUTH-FPASS-002] Forgot Password page should load successfully", () => {
            cy.visit(FORGOT_URL);

            cy.url().should("include", FORGOT_URL);
            cy.get("@messages.all").should("have.length.at.least", 1);
            cy.get(SEL.title).should("contain.text", "Reset Password");
        });

        it("[AUTH-FPASS-005] Cancel button should redirect back to login page", () => {
            cy.visit(FORGOT_URL);

            cy.get(SEL.cancelBtn).click();

            cy.url().should("include", "/auth/login");
            cy.get("@messages.all").should("have.length.at.least", 1);
        });
    });

    describe("2. Form Submission", () => {
        it("[AUTH-FPASS-003] Submit empty username should NOT trigger reset process", () => {
            cy.visit(FORGOT_URL);

            cy.get(SEL.submitBtn).click();

            cy.get(SEL.requiredMsg)
                .should("be.visible")
                .and("contain.text", "Required");

            cy.url().should("include", FORGOT_URL);
            cy.get("@messages.all").should("have.length.at.least", 1);
        });

        it("[AUTH-FPASS-004] Submit unregistered username should navigate to success page", () => {
            cy.visit(FORGOT_URL);

            cy.get(SEL.usernameInput).type("notexistuser@test.com");
            cy.get(SEL.submitBtn).click();

            cy.url({ timeout: 10000 }).should("include", CHECK_EMAIL_URL);
            cy.contains("Reset Password link sent successfully").should(
                "be.visible",
            );
            cy.get("@messages.all").should("have.length.at.least", 1);
        });

        it("[AUTH-FPASS-006] Username field should accept typing without UI crash", () => {
            cy.visit(FORGOT_URL);

            cy.get(SEL.usernameInput)
                .type("testing123")
                .should("have.value", "testing123");

            cy.get("@messages.all").should("have.length.at.least", 1);
        });
    });

    describe("3. Security", () => {
        beforeEach(() => {
            cy.on("window:alert", () => {
                throw new Error("XSS DETECTED");
            });
            cy.visit(FORGOT_URL);
        });

        it("[AUTH-FPASS-007] XSS payload should not execute script", () => {
            cy.get(SEL.usernameInput).type("<script>alert('xss')</script>");
            cy.get(SEL.submitBtn).click();

            cy.get("body").should("be.visible");
            cy.get("@messages.all").should("have.length.at.least", 1);
        });

        it("[AUTH-FPASS-008] SQL injection payload should not break application", () => {
            cy.get(SEL.usernameInput).type("' OR '1'='1");
            cy.get(SEL.submitBtn).click();

            cy.get("body").should("be.visible");
            cy.contains(/Reset Password|Required|successfully/i).should(
                "exist",
            );
            cy.get("@messages.all").should("have.length.at.least", 1);
        });
    });
});
