const API_BASE = Cypress.env('apiBaseUrl') || 'https://api.escuelajs.co/api/v1'

// ─────────────────────────────────────────────
// 1. GET - List Categories
// ─────────────────────────────────────────────
Cypress.Commands.add('apiGetCategories', () => {
  return cy.request({
    method: 'GET',
    url: `${API_BASE}/categories`,
    failOnStatusCode: false,
    timeout: Cypress.env('apiTimeout') || 10000
  }).then((response) => {
    cy.log(`Response Status: ${response.status}`)
    cy.log(`Total Categories: ${response.body?.length || 0}`)
    return cy.wrap(response)
  })
})

// ─────────────────────────────────────────────
// 2. GET - Single Category by ID
// ─────────────────────────────────────────────
Cypress.Commands.add('apiGetCategoryById', (categoryId) => {
  return cy.request({
    method: 'GET',
    url: `${API_BASE}/categories/${categoryId}`,
    failOnStatusCode: false,
    timeout: Cypress.env('apiTimeout') || 10000
  }).then((response) => {
    cy.log(`Response Status: ${response.status}`)
    if (response.status === 200) {
      cy.log(`Category Name: ${response.body?.name}`)
    }
    return cy.wrap(response)
  })
})

// ─────────────────────────────────────────────
// 3. GET - Single Category by Slug
// ─────────────────────────────────────────────
Cypress.Commands.add('apiGetCategoryBySlug', (slug) => {
  return cy.request({
    method: 'GET',
    url: `${API_BASE}/categories/slug/${slug}`,
    failOnStatusCode: false,
    timeout: Cypress.env('apiTimeout') || 10000
  }).then((response) => {
    cy.log(`Response Status: ${response.status}`)
    return cy.wrap(response)
  })
})

// ─────────────────────────────────────────────
// 4. POST - Create New Category
// ─────────────────────────────────────────────
Cypress.Commands.add('apiCreateCategory', (categoryData) => {
  return cy.request({
    method: 'POST',
    url: `${API_BASE}/categories/`,
    body: categoryData,
    failOnStatusCode: false,
    timeout: Cypress.env('apiTimeout') || 10000
  }).then((response) => {
    cy.log(`Response Status: ${response.status}`)
    if (response.status === 201) {
      cy.log(`Created Category ID: ${response.body?.id}`)
      cy.log(`Generated Slug: ${response.body?.slug}`)
    }
    return cy.wrap(response)
  })
})

// ─────────────────────────────────────────────
// 5. PUT - Update Category
// ─────────────────────────────────────────────
Cypress.Commands.add('apiUpdateCategory', (categoryId, updateData) => {
  return cy.request({
    method: 'PUT',
    url: `${API_BASE}/categories/${categoryId}`,
    body: updateData,
    failOnStatusCode: false,
    timeout: Cypress.env('apiTimeout') || 10000
  }).then((response) => {
    cy.log(`Response Status: ${response.status}`)
    return cy.wrap(response)
  })
})

// ─────────────────────────────────────────────
// 6. DELETE - Remove Category
// ─────────────────────────────────────────────
Cypress.Commands.add('apiDeleteCategory', (categoryId) => {
  return cy.request({
    method: 'DELETE',
    url: `${API_BASE}/categories/${categoryId}`,
    failOnStatusCode: false,
    timeout: Cypress.env('apiTimeout') || 10000
  }).then((response) => {
    cy.log(`Response Status: ${response.status}`)
    return cy.wrap(response)
  })
})

// ─────────────────────────────────────────────
// 7. GET - Products by Category
// ─────────────────────────────────────────────
Cypress.Commands.add('apiGetProductsByCategory', (categoryId) => {
  return cy.request({
    method: 'GET',
    url: `${API_BASE}/categories/${categoryId}/products`,
    failOnStatusCode: false,
    timeout: Cypress.env('apiTimeout') || 10000
  }).then((response) => {
    cy.log(`Response Status: ${response.status}`)
    cy.log(`Total Products: ${response.body?.length || 0}`)
    return cy.wrap(response)
  })
})

// ─────────────────────────────────────────────
// Helper: Validate Category Schema
// ─────────────────────────────────────────────
Cypress.Commands.add('validateCategorySchema', (category) => {
  // cy.log(JSON.stringify(category))
  expect(category).to.include.keys('id', 'name', 'slug', 'image');
  expect(category.id).to.be.a('number').and.to.be.greaterThan(0)
  expect(category.name).to.be.a('string').and.to.not.be.empty
  expect(category.slug).to.be.a('string').and.to.not.be.empty
  expect(category.image).to.be.a('string').and.to.include('http')
  cy.log('Schema validation passed')
})

// ─────────────────────────────────────────────
// Helper: Validate Product Schema
// ─────────────────────────────────────────────
Cypress.Commands.add('validateProductSchema', (product) => {
  expect(product).to.include.keys('id', 'title', 'slug', 'price', 'description', 'category', 'images')
  expect(product.id).to.be.a('number').and.to.be.greaterThan(0)
  expect(product.title).to.be.a('string').and.to.not.be.empty
  expect(product.price).to.be.a('number').and.to.be.greaterThan(0)
  expect(product.category).to.be.an('object')
  expect(product.category).to.have.property('id')
  expect(product.images).to.be.an('array')
  cy.log('Product schema validation passed')
})