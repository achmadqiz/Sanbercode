class ForgotPasswordPage {
    constructor(selectors) {
        this.sel = selectors;
    }

    // ─── Navigation ───────────────────────────────────────────────
    visitLogin() {
        cy.visit("/web/index.php/auth/login");
        return this;
    }

    visitForgotPassword() {
        cy.visit("/web/index.php/auth/requestPasswordResetCode");
        return this;
    }

    navigateViaLink() {
        cy.get(this.sel.forgotPasswordLink).should("be.visible").click();
        return this;
    }

    // ─── Actions ──────────────────────────────────────────────────
    fillUsername(username) {
        cy.get(this.sel.usernameInput).clear().type(username);
        return this;
    }

    submitForm() {
        cy.get(this.sel.submitBtn).click();
        return this;
    }

    clickCancel() {
        cy.get(this.sel.cancelBtn).click();
        return this;
    }

    clickBackToLogin() {
        cy.get(this.sel.backToLoginLink).click();
        return this;
    }

    // ─── Assertions / Getters ─────────────────────────────────────
    getPageTitle() {
        return cy.get(this.sel.resetTitle);
    }

    getSuccessTitle() {
        return cy.get(this.sel.successTitle);
    }

    getRequiredMessages() {
        return cy.get(this.sel.requiredHelper);
    }

    getUsernameInput() {
        return cy.get(this.sel.usernameInput);
    }

    getSubmitButton() {
        return cy.get(this.sel.submitBtn);
    }

    getCancelButton() {
        return cy.get(this.sel.cancelBtn);
    }
}

export default ForgotPasswordPage;
