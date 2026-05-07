import LoginPage from "../../pages/LoginPage";

describe("OrangeHRM | Login Feature", () => {
  let data;
  let loginPage;

  beforeEach(() => {
    cy.fixture("login").then((fixture) => {
      data = fixture;
      loginPage = new LoginPage(data.selectors);
      loginPage.visit();
    });
  });

  it("[TC_001] Login with valid username and valid password — should redirect to dashboard", () => {
    const tc = data.positiveCases[0];
    loginPage.login(tc.username, tc.password);

    cy.url().should("include", data.urls.dashboard);
    loginPage.getDashboardHeader().should("be.visible");
  });

  it("[TC_007] Login with lowercase username — system should be case-insensitive", () => {
    const tc = data.positiveCases[1];
    loginPage.login(tc.username, tc.password);

    cy.url().should("include", data.urls.dashboard);
    loginPage.getDashboardHeader().should("be.visible");
  });

  it("[TC_018] Login by pressing Enter key instead of clicking the login button — should redirect to dashboard", () => {
    const tc = data.positiveCases[2];
    loginPage.fillUsername(tc.username);
    loginPage.fillPassword(tc.password);
    loginPage.submitByEnter();

    cy.url().should("include", data.urls.dashboard);
    loginPage.getDashboardHeader().should("be.visible");
  });

  it('[TC_002] Login with valid username and wrong password — should display "Invalid credentials"', () => {
    const tc = data.invalidCredentialsCases[0];
    loginPage.login(tc.username, tc.password);

    loginPage
      .getErrorMessage()
      .should("be.visible")
      .and("contain.text", "Invalid credentials");
  });

  it('[TC_003] Login with unregistered username and random password — should display "Invalid credentials"', () => {
    const tc = data.invalidCredentialsCases[1];
    loginPage.login(tc.username, tc.password);

    loginPage
      .getErrorMessage()
      .should("be.visible")
      .and("contain.text", "Invalid credentials");
  });

  it('[TC_008] Login with username containing leading and trailing spaces — should display "Invalid credentials"', () => {
    const tc = data.invalidCredentialsCases[2];
    loginPage.login(tc.username, tc.password);

    loginPage
      .getErrorMessage()
      .should("be.visible")
      .and("contain.text", "Invalid credentials");
  });

  it('[TC_012] Login with username exceeding 100 characters — should display "Invalid credentials"', () => {
    const tc = data.invalidCredentialsCases[3];
    loginPage.login(tc.username, tc.password);

    loginPage
      .getErrorMessage()
      .should("be.visible")
      .and("contain.text", "Invalid credentials");
  });

  it('[TC_013] Login with password exceeding 100 characters — should display "Invalid credentials"', () => {
    const tc = data.invalidCredentialsCases[4];
    loginPage.login(tc.username, tc.password);

    loginPage
      .getErrorMessage()
      .should("be.visible")
      .and("contain.text", "Invalid credentials");
  });

  it('[TC_016] Login with special characters in the username field — should display "Invalid credentials"', () => {
    const tc = data.invalidCredentialsCases[5];
    loginPage.login(tc.username, tc.password);

    loginPage
      .getErrorMessage()
      .should("be.visible")
      .and("contain.text", "Invalid credentials");
  });

  it('[TC_017] Login with special characters in the password field — should display "Invalid credentials"', () => {
    const tc = data.invalidCredentialsCases[6];
    loginPage.login(tc.username, tc.password);

    loginPage
      .getErrorMessage()
      .should("be.visible")
      .and("contain.text", "Invalid credentials");
  });

  it('[TC_019] Login with numeric-only username — should display "Invalid credentials"', () => {
    const tc = data.invalidCredentialsCases[7];
    loginPage.login(tc.username, tc.password);

    loginPage
      .getErrorMessage()
      .should("be.visible")
      .and("contain.text", "Invalid credentials");
  });

  it('[TC_020] Login with numeric-only password — should display "Invalid credentials"', () => {
    const tc = data.invalidCredentialsCases[8];
    loginPage.login(tc.username, tc.password);

    loginPage
      .getErrorMessage()
      .should("be.visible")
      .and("contain.text", "Invalid credentials");
  });

  it('[TC_004] Username filled, password empty — should show "Required" below the password field', () => {
    const tc = data.requiredFieldCases[0];
    loginPage.fillUsername(tc.username);
    loginPage.submitForm();

    loginPage
      .getRequiredMessages()
      .first()
      .should("be.visible")
      .and("contain.text", "Required");
  });

  it('[TC_005] Password filled, username empty — should show "Required" below the username field', () => {
    const tc = data.requiredFieldCases[1];
    loginPage.fillPassword(tc.password);
    loginPage.submitForm();

    loginPage
      .getRequiredMessages()
      .first()
      .should("be.visible")
      .and("contain.text", "Required");
  });

  it('[TC_006] Both fields empty — should show "Required" under both fields', () => {
    loginPage.submitForm();

    loginPage
      .getRequiredMessages()
      .should("have.length.at.least", 2)
      .each(($el) => cy.wrap($el).should("contain.text", "Required"));
  });

  it("[TC_009] SQL injection in the username field — should not bypass login", () => {
    const tc = data.securityCases[0];
    loginPage.login(tc.username, tc.password);

    loginPage
      .getErrorMessage()
      .should("be.visible")
      .and("contain.text", "Invalid credentials");
  });

  it("[TC_010] SQL injection in the password field — should not bypass login", () => {
    const tc = data.securityCases[1];
    loginPage.login(tc.username, tc.password);

    loginPage
      .getErrorMessage()
      .should("be.visible")
      .and("contain.text", "Invalid credentials");
  });

  it("[TC_011] XSS payload in the username field — script should not execute", () => {
    cy.on("window:alert", () => {
      throw new Error("XSS vulnerability detected: alert() was triggered!");
    });

    const tc = data.securityCases[2];
    loginPage.login(tc.username, tc.password);

    loginPage
      .getErrorMessage()
      .should("be.visible")
      .and("contain.text", "Invalid credentials");
  });

  it('[TC_014] Password field should mask input characters (type="password")', () => {
    loginPage
      .getPasswordField()
      .should("have.attr", "type", "password")
      .type("admin123")
      .should("have.attr", "type", "password");
  });
});
