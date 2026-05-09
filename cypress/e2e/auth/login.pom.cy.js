import LoginPage from "../../pages/LoginPage";

describe("OrangeHRM | Login Feature - POM Tests", () => {
    let data;
    let loginPage;

    beforeEach(() => {
        cy.fixture("login").then((fixture) => {
            data = fixture;
            loginPage = new LoginPage(data.selectors);
            loginPage.visit();
        });
    });

    describe("Positive Cases", () => {
        it("[AUTH-LOGIN-001] Valid credentials redirect to dashboard", () => {
            loginPage.login(
                data.credentials.admin.username,
                data.credentials.admin.password,
            );
            cy.url().should("include", data.urls.dashboard);
            loginPage.getDashboardHeader().should("be.visible");
        });

        it("[AUTH-LOGIN-002] Lowercase username is case-insensitive", () => {
            loginPage.login(
                data.credentials.lowercase.username,
                data.credentials.lowercase.password,
            );
            cy.url().should("include", data.urls.dashboard);
            loginPage.getDashboardHeader().should("be.visible");
        });

        it("[AUTH-LOGIN-003] Enter key submits form", () => {
            loginPage.fillUsername(data.credentials.admin.username);
            loginPage.fillPassword(data.credentials.admin.password);
            loginPage.submitByEnter();
            cy.url().should("include", data.urls.dashboard);
            loginPage.getDashboardHeader().should("be.visible");
        });
    });

    describe("Negative Cases", () => {
        context("Invalid Credentials", () => {
            it('[AUTH-LOGIN-004] Wrong password shows "Invalid credentials"', () => {
                loginPage.login(data.credentials.admin.username, "wrongpass");
                loginPage
                    .getErrorMessage()
                    .should("contain.text", "Invalid credentials");
            });

            it('[AUTH-LOGIN-005] Unregistered username shows "Invalid credentials"', () => {
                loginPage.login("randomuser", "randompass");
                loginPage
                    .getErrorMessage()
                    .should("contain.text", "Invalid credentials");
            });

            it('[AUTH-LOGIN-006] Username with leading/trailing spaces shows "Invalid credentials"', () => {
                loginPage.login(" Admin ", data.credentials.admin.password);
                loginPage
                    .getErrorMessage()
                    .should("contain.text", "Invalid credentials");
            });

            it('[AUTH-LOGIN-007] Username >100 chars shows "Invalid credentials"', () => {
                loginPage.login(
                    data.payloads.long100,
                    data.credentials.admin.password,
                );
                loginPage
                    .getErrorMessage()
                    .should("contain.text", "Invalid credentials");
            });

            it('[AUTH-LOGIN-008] Password >100 chars shows "Invalid credentials"', () => {
                loginPage.login(
                    data.credentials.admin.username,
                    data.payloads.long100,
                );
                loginPage
                    .getErrorMessage()
                    .should("contain.text", "Invalid credentials");
            });

            it('[AUTH-LOGIN-009] Special chars in username shows "Invalid credentials"', () => {
                loginPage.login(
                    "Admin" + data.payloads.specialChars,
                    data.credentials.admin.password,
                );
                loginPage
                    .getErrorMessage()
                    .should("contain.text", "Invalid credentials");
            });

            it('[AUTH-LOGIN-010] Special chars in password shows "Invalid credentials"', () => {
                loginPage.login(
                    data.credentials.admin.username,
                    data.payloads.specialChars,
                );
                loginPage
                    .getErrorMessage()
                    .should("contain.text", "Invalid credentials");
            });

            it('[AUTH-LOGIN-011] Numeric-only username shows "Invalid credentials"', () => {
                loginPage.login(
                    data.payloads.numericOnly,
                    data.credentials.admin.password,
                );
                loginPage
                    .getErrorMessage()
                    .should("contain.text", "Invalid credentials");
            });

            it('[AUTH-LOGIN-012] Numeric-only password shows "Invalid credentials"', () => {
                loginPage.login(
                    data.credentials.admin.username,
                    data.payloads.numericOnly,
                );
                loginPage
                    .getErrorMessage()
                    .should("contain.text", "Invalid credentials");
            });
        });

        context("Required Field Validation", () => {
            it('[AUTH-LOGIN-013] Empty password shows "Required"', () => {
                loginPage.fillUsername(data.credentials.admin.username);
                loginPage.submitForm();
                loginPage
                    .getRequiredMessages()
                    .first()
                    .should("contain.text", "Required");
            });

            it('[AUTH-LOGIN-014] Empty username shows "Required"', () => {
                loginPage.fillPassword("randompass");
                loginPage.submitForm();
                loginPage
                    .getRequiredMessages()
                    .first()
                    .should("contain.text", "Required");
            });

            it('[AUTH-LOGIN-015] Both empty shows "Required" under both fields', () => {
                loginPage.submitForm();
                loginPage
                    .getRequiredMessages()
                    .should("have.length.at.least", 2)
                    .each(($el) =>
                        cy.wrap($el).should("contain.text", "Required"),
                    );
            });
        });
    });

    describe("Security Cases", () => {
        it("[AUTH-LOGIN-016] SQL injection in username does not bypass login", () => {
            loginPage.login(data.payloads.sql, "anything");
            loginPage
                .getErrorMessage()
                .should("contain.text", "Invalid credentials");
        });

        it("[AUTH-LOGIN-017] SQL injection in password does not bypass login", () => {
            loginPage.login(data.credentials.admin.username, data.payloads.sql);
            loginPage
                .getErrorMessage()
                .should("contain.text", "Invalid credentials");
        });

        it("[AUTH-LOGIN-018] XSS payload in username does not execute", () => {
            cy.on("window:alert", () => {
                throw new Error(
                    "XSS vulnerability detected: alert() was triggered!",
                );
            });
            loginPage.login(data.payloads.xss, data.credentials.admin.password);
            loginPage
                .getErrorMessage()
                .should("contain.text", "Invalid credentials");
        });
    });

    describe("UI / UX Cases", () => {
        it('[AUTH-LOGIN-019] Password field masks input (type="password")', () => {
            loginPage
                .getPasswordField()
                .should("have.attr", "type", "password")
                .type("admin123")
                .should("have.attr", "type", "password");
        });
    });
});
