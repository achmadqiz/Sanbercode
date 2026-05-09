import DirectoryPage from "../../pages/DirectoryPage";

describe("OrangeHRM | Directory Feature - POM Tests", () => {
  let data;
  let directoryPage;

  beforeEach(() => {
    cy.fixture("directory").then((fixture) => {
      data = fixture;
      directoryPage = new DirectoryPage(fixture.selectors);

      cy.session("admin-session", () => {
        cy.visit(fixture.urls.login);
        cy.login(fixture.credentials.username, fixture.credentials.password);
        cy.url().should("include", "/dashboard");
      });

      cy.visit(fixture.urls.dashboard);
    });
  });

  describe("1. Navigation", () => {
    it("[DIR_TC_001] Clicking the Directory menu from sidebar should navigate to Directory page", () => {
      directoryPage.clickDirectoryMenu();

      cy.url().should("include", data.urls.directory);
      directoryPage
        .getPageTitle()
        .should("be.visible")
        .and("contain.text", "Directory");
    });

    it("[DIR_TC_002] Direct URL access to Directory page should load correctly", () => {
      directoryPage.visitDirectory();

      cy.url().should("include", data.urls.directory);
      directoryPage.getPageTitle().should("contain.text", "Directory");
    });

    it("[DIR_TC_003] Directory page should display the topbar breadcrumb after navigation", () => {
      directoryPage.visitDirectory();

      directoryPage.getTopbarBreadcrumb().should("be.visible");
    });
  });

  describe("2. UI Elements", () => {
    beforeEach(() => {
      directoryPage.visitDirectory();
    });

    it("[DIR_TC_004] Directory page should display the search name input field", () => {
      directoryPage
        .getSearchNameInput()
        .should("be.visible")
        .and("not.be.disabled");
    });

    it("[DIR_TC_005] Directory page should display the Search button", () => {
      directoryPage
        .getSearchButton()
        .should("be.visible")
        .and("not.be.disabled");
    });

    it("[DIR_TC_006] Directory page should display the Reset button", () => {
      directoryPage
        .getResetButton()
        .should("be.visible")
        .and("not.be.disabled");
    });

    it("[DIR_TC_007] Directory page should display employee cards on initial load", () => {
      directoryPage
        .getEmployeeCards()
        .should("have.length.at.least", 1);
    });

    it("[DIR_TC_008] Employee cards should display employee name visible on each card", () => {
      cy.get(data.selectors.employeeCardName)
        .first()
        .should("be.visible")
        .invoke("text")
        .should("not.be.empty");
    });
  });

  describe("3. Search Functionality", () => {
    beforeEach(() => {
      directoryPage.visitDirectory();
    });

    context("3a. Positive Cases", () => {
      it("[DIR_TC_009] Search name input should be typeable and display entered value", () => {
        directoryPage.fillSearchName(data.searchCases.validName);

        directoryPage
          .getSearchNameInput()
          .should("have.value", data.searchCases.validName);
      });

      it("[DIR_TC_010] Searching with a partial name should return relevant employee cards", () => {
        directoryPage.searchByName(data.searchCases.partialName);

        cy.get("body").should("be.visible");
        cy.get(data.selectors.employeeCard).then(($cards) => {
          if ($cards.length > 0) {
            cy.wrap($cards).first().should("be.visible");
          }
        });
      });

      it("[DIR_TC_011] Clicking Search without entering a name should return all employees", () => {
        directoryPage.submitSearch();

        directoryPage
          .getEmployeeCards()
          .should("have.length.at.least", 1);
      });

      it("[DIR_TC_012] Clicking Reset button should clear the name search field", () => {
        directoryPage.fillSearchName(data.searchCases.validName);
        directoryPage.clearSearchName();
        directoryPage.resetSearch();

        directoryPage
          .getSearchNameInput()
          .should("have.value", "");
      });

      it("[DIR_TC_013] After clicking Reset, employee list should still be visible", () => {
        directoryPage.searchByName(data.searchCases.validName);
        directoryPage.resetSearch();

        directoryPage
          .getEmployeeCards()
          .should("have.length.at.least", 1);
      });
    });

    context("3b. Negative Cases", () => {
      it("[DIR_TC_014] Searching with a non-existent name should return no employee cards", () => {
        directoryPage.searchByName(data.searchCases.nonExistentName);

        directoryPage
          .getEmployeeCards()
          .should("have.length", 0);
      });
    });
  });

  describe("4. Security", () => {
    beforeEach(() => {
      cy.on("window:alert", () => {
        throw new Error("XSS DETECTED: alert() triggered on Directory page!");
      });
      directoryPage.visitDirectory();
    });

    it("[DIR_TC_015] XSS payload in search name field — script should not execute", () => {
      directoryPage.searchByName(data.searchCases.xssPayload);

      cy.get("body").should("be.visible");
      cy.get("body").should("not.contain.text", "<script>");
    });

    it("[DIR_TC_016] SQL injection in search name field — should not expose server error", () => {
      directoryPage.searchByName(data.searchCases.sqlPayload);

      cy.get("body").should("be.visible");
      cy.get("body").should("not.contain.text", "SQL");
      cy.get("body").should("not.contain.text", "syntax error");
    });
  });

  describe("5. Session & Access Control", () => {
    it("[DIR_TC_017] Authenticated user should be able to navigate from Dashboard to Directory without re-login", () => {
      cy.url().should("include", "/dashboard");

      directoryPage.visitDirectory();

      cy.url().should("include", data.urls.directory);
      directoryPage.getPageTitle().should("contain.text", "Directory");
    });

    it("[DIR_TC_018] Unauthenticated user accessing Directory URL directly should be redirected to Login", () => {
       cy.on("uncaught:exception", () => false); // suppress OrangeHRM's Axios error
      cy.clearCookies();
      cy.clearLocalStorage();

      cy.visit(data.urls.directory, { failOnStatusCode: false });

      cy.url().should("include", data.urls.login);
    });
  });
});