const { defineConfig } = require("cypress");

module.exports = defineConfig({
    e2e: {
        baseUrl: "https://opensource-demo.orangehrmlive.com",
        specPattern: "cypress/e2e/**/*.cy.js",
        fixturesFolder: "cypress/fixtures",
        supportFile: "cypress/support/e2e.js",

        experimentalRunAllSpecs: true,

        defaultCommandTimeout: 8000,
        pageLoadTimeout: 30000,
        responseTimeout: 15000,

        // API Testing Configuration
        env: {
            apiBaseUrl: "https://api.escuelajs.co/api/v1",
            apiTimeout: 10000,
        },

        setupNodeEvents(on, config) {
            return config;
        },
    },
});
