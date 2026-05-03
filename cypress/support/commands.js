Cypress.Commands.add('login', (username, password) => {
  if (username !== '') cy.get('[name="username"]').clear().type(username)
  if (password !== '') cy.get('[name="password"]').clear().type(password)
  cy.get('[type="submit"]').click()
})
 