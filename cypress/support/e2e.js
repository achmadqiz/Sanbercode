// Import commands.js using ES2015 syntax:
import './commands'

// Global configuration for API testing
import './api-commands'

cy.on('fail', (error, runnable) => {
  cy.log(`TEST FAILED: ${error.message}`)
  throw error
})