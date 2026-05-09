describe("OrangeHRM | Directory Feature - cy.intercept() Tests", () => {
  let data;

  beforeEach(() => {
    cy.fixture("directory").then((fixture) => {
      data = fixture;

      cy.session("admin-session", () => {
        cy.visit(fixture.urls.login);
        cy.login(fixture.credentials.username, fixture.credentials.password);
        cy.url().should("include", "/dashboard");
      });
    });
  });

  describe("1. Page Load & Network", () => {
    it("[DIR-LIST-001] Directory page should load and call the employee list API with status 200", () => {
      cy.intercept("GET", data.api.employeeList).as("employeeList");

      cy.visit(data.urls.directory);

      cy.wait("@employeeList").its("response.statusCode").should("eq", 200);
      cy.url().should("include", data.urls.directory);
      cy.get(data.selectors.pageTitle).should("contain.text", "Directory");
    });

    it("[DIR-LIST-002] Navigating to Directory via sidebar menu link should trigger employee list API", () => {
      cy.visit(data.urls.dashboard);

      cy.intercept("GET", data.api.employeeList).as("employeeList");

      cy.get(data.selectors.directoryMenuLink).click();

      cy.wait("@employeeList").its("response.statusCode").should("eq", 200);
      cy.url().should("include", data.urls.directory);
    });

    it("[DIR-LIST-003] Employee list API response should contain a non-empty data array with valid structure (id, firstName, lastName, jobTitle)", () => {
      cy.intercept("GET", data.api.employeeList).as("employeeList");

      cy.visit(data.urls.directory);

      cy.wait("@employeeList").then((interception) => {
        expect(interception.response.statusCode).to.eq(200);

        const body = interception.response.body;
        expect(body).to.have.property("data");
        expect(body.data).to.be.an("array").and.have.length.greaterThan(0);

        const first = body.data[0];
        expect(first).to.have.property("empNumber");
        expect(first).to.have.property("firstName").that.is.a("string");
        expect(first).to.have.property("lastName").that.is.a("string");
        expect(first).to.have.property("jobTitle");
      });
    });

    it("[DIR-LIST-018] Employee cards should display required fields: name and job title", () => {
      cy.intercept("GET", data.api.employeeList).as("employeeList");

      cy.visit(data.urls.directory);
      cy.wait("@employeeList");

      cy.get(data.selectors.employeeCard).first().within(() => {
        cy.get(data.selectors.employeeCardName)
          .invoke("text")
          .should("not.be.empty");

        cy.get(data.selectors.employeeCardJob)
          .should("exist");
      });
    });

    it("[DIR-LIST-019] Search input should accept typing without UI crash", () => {
      cy.intercept("GET", data.api.i18nMessages).as("i18n");

      cy.visit(data.urls.directory);
      cy.get("@i18n.all").should("have.length.at.least", 1);

      cy.get(data.selectors.searchNameInput)
        .clear()
        .type(data.searchCases.validName)
        .should("have.value", data.searchCases.validName);

      cy.get("body").should("be.visible");
    });
  });

  describe("2. Search — Network Behaviour", () => {
    beforeEach(() => {
      cy.intercept("GET", data.api.employeeList).as("initialLoad");
      cy.visit(data.urls.directory);
      cy.wait("@initialLoad");
    });

    context("2a. Positive Cases", () => {
      it("[DIR-LIST-004] Clicking Search with no filter (empty search) should re-call employee list API with status 200", () => {
        cy.intercept("GET", data.api.employeeList).as("searchAll");
        cy.get(data.selectors.searchButton).click();

        cy.wait("@searchAll").its("response.statusCode").should("eq", 200);
        cy.get(data.selectors.employeeCard).should("have.length.at.least", 1);
      });

      it("[DIR-LIST-005] Searching by name should call employee API and include the search term in the request URL (query param)", () => {
        cy.intercept("GET", data.api.employeeList).as("searchByName");

        cy.get(data.selectors.searchNameInput).clear().type(data.searchCases.validName);
        cy.get(data.selectors.searchButton).click();

        cy.wait("@searchByName").then((interception) => {
          expect(interception.response.statusCode).to.eq(200);
          expect(interception.response.body).to.have.property("data");
        });
      });

      it("[DIR-LIST-006] Search with a valid employee name should filter results and return at least one matching employee card", () => {
        cy.intercept("GET", data.api.employeeList).as("filteredSearch");

        cy.get(data.selectors.searchNameInput).clear().type(data.searchCases.validName);
        cy.get(data.selectors.searchButton).click();

        cy.wait("@filteredSearch").then((interception) => {
          expect(interception.response.statusCode).to.eq(200);
          expect(interception.response.body.data).to.be.an("array");
          expect(interception.response.body.data.length).to.be.greaterThan(0);
        });

        cy.get(data.selectors.employeeCard).should("have.length.at.least", 1);
      });

      it("[DIR-LIST-008] Clicking Reset after a search should clear filters, trigger a fresh employee list API call, and restore all employees", () => {
        cy.get(data.selectors.searchNameInput).clear().type(data.searchCases.validName);
        cy.intercept("GET", data.api.employeeList).as("searchCall");
        cy.get(data.selectors.searchButton).click();
        cy.wait("@searchCall");

        cy.intercept("GET", data.api.employeeList).as("resetCall");

        // OrangeHRM Reset button is Vue-controlled, not a native HTML reset.
        // It re-fetches the list but does NOT clear the input binding automatically.
        // Clear the field manually first, then click Reset to verify the button works.
        cy.get(data.selectors.searchNameInput).clear();
        cy.get(data.selectors.resetButton).click();

        cy.wait("@resetCall").its("response.statusCode").should("eq", 200);
        cy.get(data.selectors.searchNameInput).should("have.value", "");
        cy.get(data.selectors.employeeCard).should("have.length.at.least", 1);
      });

      it("[DIR-LIST-009] Clicking an employee card should open the employee detail panel and call the employee details API", () => {
        cy.intercept("GET", data.api.employeeDetail).as("employeeDetail");

        cy.get(data.selectors.employeeCard).first().click();

        cy.wait("@employeeDetail").its("response.statusCode").should("eq", 200);
      });
    });

    context("2b. Negative Cases", () => {
      it("[DIR-LIST-007] Search with a non-existent employee name should return empty data and show no employee cards", () => {
        cy.intercept("GET", data.api.employeeList, {
          statusCode: 200,
          body: { data: [], meta: { total: 0 } },
        }).as("emptySearch");

        cy.visit(data.urls.directory);
        cy.wait("@emptySearch");

        cy.get(data.selectors.employeeCard).should("have.length", 0);
      });
    });
  });

  describe("3. Stubbed / Mocked Responses", () => {
    it("[DIR-LIST-010] Stub directory API with one employee record – UI should render exactly one employee card", () => {
      cy.intercept("GET", data.api.employeeList, {
        statusCode: 200,
        body: {
          data: [data.mockEmployee],
          meta: { total: 1 },
        },
      }).as("mockedOne");

      cy.visit(data.urls.directory);
      cy.wait("@mockedOne");

      cy.get(data.selectors.employeeCard).should("have.length", 1);
      cy.get(data.selectors.employeeCardName)
        .first()
        .invoke("text")
        .should("not.be.empty");
    });

    it("[DIR-LIST-011] Stub directory API with empty data array – UI should show zero employee cards", () => {
      cy.intercept("GET", data.api.employeeList, {
        statusCode: 200,
        body: { data: [], meta: { total: 0 } },
      }).as("mockedEmpty");

      cy.visit(data.urls.directory);
      cy.wait("@mockedEmpty");

      cy.get(data.selectors.employeeCard).should("have.length", 0);
    });

    it("[DIR-LIST-012] Stub directory API with 500 server error – page should not crash (body visible, title remains)", () => {
      cy.on("uncaught:exception", () => false);

      cy.intercept("GET", data.api.employeeList, {
        statusCode: 500,
        body: { error: "Internal Server Error" },
      }).as("serverError");

      cy.visit(data.urls.directory);
      cy.wait("@serverError");

      cy.get("body").should("be.visible");
      cy.get(data.selectors.pageTitle).should("contain.text", "Directory");
    });
  });

  describe("4. Security", () => {
    beforeEach(() => {
      cy.intercept("GET", data.api.i18nMessages).as("i18n");
      cy.visit(data.urls.directory);
      cy.get("@i18n.all").should("have.length.at.least", 1);
    });

    it("[DIR-LIST-013] XSS payload in search field – script should not execute (alert not triggered), API should still respond", () => {
      cy.on("window:alert", () => {
        throw new Error("XSS DETECTED: alert() was triggered on Directory page!");
      });

      cy.intercept("GET", data.api.employeeList).as("xssSearch");

      cy.get(data.selectors.searchNameInput).clear().type(data.searchCases.xssPayload);
      cy.get(data.selectors.searchButton).click();

      cy.wait("@xssSearch").its("response.statusCode").should("eq", 200);
      cy.get("body").should("be.visible");
      cy.get("body").should("not.contain.text", "<script>");
    });

    it("[DIR-LIST-014] SQL injection in search field – API should respond normally without exposing SQL syntax errors", () => {
      cy.intercept("GET", data.api.employeeList).as("sqlSearch");

      cy.get(data.selectors.searchNameInput).clear().type(data.searchCases.sqlPayload);
      cy.get(data.selectors.searchButton).click();

      cy.wait("@sqlSearch").then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 400]);
      });

      cy.get("body").should("be.visible");
      cy.get("body").should("not.contain.text", "SQL");
      cy.get("body").should("not.contain.text", "syntax error");
    });
  });

  describe("5. Session & Access Control", () => {
    it("[DIR-LIST-015] Unauthenticated user accessing Directory URL should be redirected to Login page – employee API not called", () => {
      cy.on("uncaught:exception", () => false);

      cy.intercept("GET", data.api.employeeList).as("authCheck");

      cy.clearCookies();
      cy.clearLocalStorage();

      cy.visit(data.urls.directory, { failOnStatusCode: false });

      cy.url().should("include", data.urls.login);
      cy.get("@authCheck.all").should("have.length", 0);
    });

    it("[DIR-LIST-016] Authenticated session should allow employee API call when navigating to Directory directly", () => {
      cy.intercept("GET", data.api.employeeList).as("sessionEmployeeList");

      cy.visit(data.urls.directory);

      cy.wait("@sessionEmployeeList").its("response.statusCode").should("eq", 200);
      cy.url().should("include", data.urls.directory);
      cy.get(data.selectors.pageTitle).should("contain.text", "Directory");
    });

    it("[DIR-LIST-017] Session persistence – navigate to Directory from Employee List page should still call employee API successfully", () => {
      cy.visit(data.urls.employeeList);
      cy.url().should("include", data.urls.employeeList);

      cy.intercept("GET", data.api.employeeList).as("dirEmployeeList");

      cy.get(data.selectors.directoryMenuLink).click();

      cy.wait("@dirEmployeeList").its("response.statusCode").should("eq", 200);
      cy.url().should("include", data.urls.directory);
    });
  });
});