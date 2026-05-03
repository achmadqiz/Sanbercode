const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://opensource-demo.orangehrmlive.com',

    specPattern:    'cypress/e2e/**/*.cy.js',
    fixturesFolder: 'cypress/fixtures',
    supportFile:    'cypress/support/e2e.js',

    defaultCommandTimeout: 8000,
    pageLoadTimeout:       30000,
    responseTimeout:       15000,

    setupNodeEvents (on, config) {
      return config
    },
  },
})