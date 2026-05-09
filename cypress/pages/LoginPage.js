class LoginPage {
    constructor(sel) {
        this.sel = sel;
    }

    visit() {
        cy.visit("/web/index.php/auth/login");
    }

    fillUsername(value) {
        if (value !== "") cy.get(this.sel.usernameInput).clear().type(value);
    }

    fillPassword(value) {
        if (value !== "") cy.get(this.sel.passwordInput).clear().type(value);
    }

    submitForm() {
        cy.get(this.sel.loginButton).click();
    }

    submitByEnter() {
        cy.get(this.sel.passwordInput).type("{enter}");
    }

    login(username, password) {
        this.fillUsername(username);
        this.fillPassword(password);
        this.submitForm();
    }

    getErrorMessage() {
        return cy.get(this.sel.errorMessage);
    }

    getRequiredMessages() {
        return cy.get(this.sel.requiredHelper);
    }

    getDashboardHeader() {
        return cy.get(this.sel.dashboardHeader);
    }

    getPasswordField() {
        return cy.get(this.sel.passwordInput);
    }

    getForgotPasswordLink() {
        return cy.get(this.sel.forgotPassword);
    }
}

export default LoginPage;
