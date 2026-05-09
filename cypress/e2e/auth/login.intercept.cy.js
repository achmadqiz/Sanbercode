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

describe("OrangeHRM | Login - cy.intercept() Tests", () => {
    beforeEach(() => {
        cy.visit(LOGIN_URL);
    });

    describe("Positive Cases", () => {
        it("[AUTH-LOGIN-001] Valid credentials - dashboard API responds 200", () => {
            cy.intercept("GET", API.dashboard).as("actionSummary");

            cy.login("Admin", "admin123");

            cy.wait("@actionSummary")
                .its("response.statusCode")
                .should("eq", 200);
            cy.url().should("include", DASHBOARD);
            cy.get(SEL.topbarHeader).should("be.visible");
        });

        it("[AUTH-LOGIN-002] Lowercase username - dashboard API responds 200", () => {
            cy.intercept("GET", API.dashboard).as("actionSummary");

            cy.login("admin", "admin123");

            cy.wait("@actionSummary")
                .its("response.statusCode")
                .should("eq", 200);
            cy.url().should("include", DASHBOARD);
        });

        it("[AUTH-LOGIN-003] Enter key submits - dashboard API responds 200", () => {
            cy.intercept("GET", API.dashboard).as("actionSummary");

            cy.get(SEL.username).type("Admin");
            cy.get(SEL.password).type("admin123").type("{enter}");

            cy.wait("@actionSummary")
                .its("response.statusCode")
                .should("eq", 200);
            cy.url().should("include", DASHBOARD);
            cy.get(SEL.topbarHeader).should("be.visible");
        });

        it("[AUTH-LOGIN-020] Active session - navigate to Employee List calls employees API 200", () => {
            cy.intercept("GET", API.dashboard).as("actionSummary");
            cy.login("Admin", "admin123");
            cy.wait("@actionSummary")
                .its("response.statusCode")
                .should("eq", 200);

            cy.intercept("GET", API.empList).as("empListApi");
            cy.visit(EMPLOYEE);

            cy.wait("@empListApi").its("response.statusCode").should("eq", 200);
            cy.url().should("include", EMPLOYEE);
            cy.get(SEL.topbarHeader).should("be.visible");
        });
    });

    describe("Negative Cases", () => {
        context("Invalid Credentials", () => {
            it("[AUTH-LOGIN-004] Wrong password - page not redirected, dashboard API not called", () => {
                cy.intercept("GET", API.dashboard).as("actionSummary");

                cy.login("Admin", "wrongpass");

                cy.get(SEL.errorMsg)
                    .should("be.visible")
                    .and("contain.text", "Invalid credentials");

                cy.url().should("include", LOGIN_URL);
                cy.get("@actionSummary.all").should("have.length", 0);
            });

            it("[AUTH-LOGIN-005] Unregistered username - error message appears", () => {
                cy.intercept("GET", API.dashboard).as("actionSummary");

                cy.login("randomuser", "admin123");

                cy.get(SEL.errorMsg)
                    .should("be.visible")
                    .and("contain.text", "Invalid credentials");

                cy.url().should("include", LOGIN_URL);
                cy.get("@actionSummary.all").should("have.length", 0);
            });

            it('[AUTH-LOGIN-006] Leading/trailing spaces - shows "Invalid credentials"', () => {
                cy.intercept("GET", API.dashboard).as("actionSummary");

                cy.login(" Admin ", "admin123");
                cy.get("@actionSummary.all").should("have.length", 0);

                cy.get(SEL.errorMsg)
                    .should("be.visible")
                    .and("contain.text", "Invalid credentials");

                cy.url().should("include", LOGIN_URL);
            });
        });

        context("Required Field Validation", () => {
            it('[AUTH-LOGIN-013] Empty password - client-side validation stops request, shows "Required"', () => {
                cy.intercept("POST", "**/auth/validate").as("loginPost");

                cy.login("Admin", "");

                cy.get("@loginPost.all").should("have.length", 0);
                cy.get(SEL.requiredMsg)
                    .should("be.visible")
                    .and("contain.text", "Required");
            });

            it('[AUTH-LOGIN-015] Both empty - client-side validation stops request, shows "Required"', () => {
                cy.intercept("POST", "**/auth/validate").as("loginPost");

                cy.get(SEL.submitBtn).click();

                cy.get("@loginPost.all").should("have.length", 0);
                cy.get(SEL.requiredMsg)
                    .should("have.length.at.least", 2)
                    .each(($el) => {
                        cy.wrap($el).should("contain.text", "Required");
                    });
            });
        });
    });

    describe("Security Cases", () => {
        it("[AUTH-LOGIN-016] SQL injection in username - server rejects, login not bypassed", () => {
            // Assert the request actually reaches the server (not blocked client-side)
            cy.intercept("POST", "**/auth/validate").as("loginPost");

            cy.login("' OR '1'='1", "admin123");

            cy.get("@loginPost.all").should("have.length.at.least", 1);
            cy.get(SEL.errorMsg)
                .should("be.visible")
                .and("contain.text", "Invalid credentials");
            cy.url().should("include", LOGIN_URL);
        });

        it("[AUTH-LOGIN-017] SQL injection in password - server rejects, login not bypassed", () => {
            cy.intercept("POST", "**/auth/validate").as("loginPost");

            cy.login("Admin", "' OR '1'='1");

            cy.get("@loginPost.all").should("have.length.at.least", 1);
            cy.get(SEL.errorMsg)
                .should("be.visible")
                .and("contain.text", "Invalid credentials");
            cy.url().should("include", LOGIN_URL);
        });

        it("[AUTH-LOGIN-018] XSS payload in username - script not executed, login fails", () => {
            cy.on("window:alert", () => {
                throw new Error("XSS DETECTED: alert() triggered in browser!");
            });

            cy.intercept("POST", "**/auth/validate").as("loginPost");

            cy.login("<script>alert('xss')</script>", "admin123");

            cy.get("@loginPost.all").should("have.length.at.least", 1);
            cy.get(SEL.errorMsg)
                .should("be.visible")
                .and("contain.text", "Invalid credentials");
        });
    });
});
