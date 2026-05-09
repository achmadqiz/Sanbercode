class DirectoryPage {
    constructor(selectors) {
        this.sel = selectors;
    }

    // ─────────────────────────────────────────────
    // Navigation helpers
    // ─────────────────────────────────────────────

    visitLogin() {
        cy.visit("/web/index.php/auth/login");
    }

    visitDirectory() {
        cy.visit("/web/index.php/directory/viewDirectory");
    }

    loginAs(username, password) {
        cy.get(this.sel.usernameInput).clear().type(username);
        cy.get(this.sel.passwordInput).clear().type(password);
        cy.get(this.sel.loginButton).click();
        cy.url().should("include", "/dashboard");
    }

    // ─────────────────────────────────────────────
    // Sidebar navigation
    // ─────────────────────────────────────────────

    clickDirectoryMenu() {
        cy.get(this.sel.directoryMenuLink).click();
    }

    // ─────────────────────────────────────────────
    // Page element getters
    // ─────────────────────────────────────────────

    getPageTitle() {
        return cy.get(this.sel.pageTitle);
    }

    getTopbarBreadcrumb() {
        return cy.get(this.sel.topbarBreadcrumb);
    }

    getSearchNameInput() {
        return cy.get(this.sel.searchNameInput);
    }

    getJobTitleDropdown() {
        return cy.get(this.sel.jobTitleDropdown);
    }

    getSearchButton() {
        return cy.get(this.sel.searchButton);
    }

    getResetButton() {
        return cy.get(this.sel.resetButton);
    }

    getEmployeeCards() {
        return cy.get(this.sel.employeeCard);
    }

    // ─────────────────────────────────────────────
    // Action helpers
    // ─────────────────────────────────────────────

    fillSearchName(name) {
        this.getSearchNameInput().clear().type(name);
    }

    clearSearchName() {
        this.getSearchNameInput().clear();
    }

    submitSearch() {
        this.getSearchButton().click();
    }

    resetSearch() {
        this.getResetButton().click();
    }

    searchByName(name) {
        this.fillSearchName(name);
        this.submitSearch();
    }
}

export default DirectoryPage;
