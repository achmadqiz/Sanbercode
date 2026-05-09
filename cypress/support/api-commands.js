import Ajv from "ajv";
import addFormats from "ajv-formats";
import { categorySchema, productSchema } from "../schemas/category-schema";

const ajv = new Ajv({ allErrors: true }); // allErrors: report ALL failures, not just first
addFormats(ajv);

const validateCategory = ajv.compile(categorySchema);
const validateProduct = ajv.compile(productSchema);

const API_BASE = Cypress.env("apiBaseUrl") || "https://api.escuelajs.co/api/v1";

Cypress.Commands.add("apiGetCategories", () => {
    return cy
        .request({
            method: "GET",
            url: `${API_BASE}/categories`,
            failOnStatusCode: false,
            timeout: Cypress.env("apiTimeout") || 10000,
        })
        .then((response) => {
            cy.log(`Response Status: ${response.status}`);
            cy.log(`Total Categories: ${response.body?.length || 0}`);
            return cy.wrap(response);
        });
});

Cypress.Commands.add("apiGetCategoryById", (categoryId) => {
    return cy
        .request({
            method: "GET",
            url: `${API_BASE}/categories/${categoryId}`,
            failOnStatusCode: false,
            timeout: Cypress.env("apiTimeout") || 10000,
        })
        .then((response) => {
            cy.log(`Response Status: ${response.status}`);
            if (response.status === 200) {
                cy.log(`Category Name: ${response.body?.name}`);
            }
            return cy.wrap(response);
        });
});

Cypress.Commands.add("apiGetCategoryBySlug", (slug) => {
    return cy
        .request({
            method: "GET",
            url: `${API_BASE}/categories/slug/${slug}`,
            failOnStatusCode: false,
            timeout: Cypress.env("apiTimeout") || 10000,
        })
        .then((response) => {
            cy.log(`Response Status: ${response.status}`);
            return cy.wrap(response);
        });
});

Cypress.Commands.add("apiCreateCategory", (categoryData) => {
    return cy
        .request({
            method: "POST",
            url: `${API_BASE}/categories/`,
            body: categoryData,
            failOnStatusCode: false,
            timeout: Cypress.env("apiTimeout") || 10000,
        })
        .then((response) => {
            cy.log(`Response Status: ${response.status}`);
            if (response.status === 201) {
                cy.log(`Created Category ID: ${response.body?.id}`);
                cy.log(`Generated Slug: ${response.body?.slug}`);
            }
            return cy.wrap(response);
        });
});

Cypress.Commands.add("apiUpdateCategory", (categoryId, updateData) => {
    return cy
        .request({
            method: "PUT",
            url: `${API_BASE}/categories/${categoryId}`,
            body: updateData,
            failOnStatusCode: false,
            timeout: Cypress.env("apiTimeout") || 10000,
        })
        .then((response) => {
            cy.log(`Response Status: ${response.status}`);
            return cy.wrap(response);
        });
});

Cypress.Commands.add("apiDeleteCategory", (categoryId) => {
    return cy
        .request({
            method: "DELETE",
            url: `${API_BASE}/categories/${categoryId}`,
            failOnStatusCode: false,
            timeout: Cypress.env("apiTimeout") || 10000,
        })
        .then((response) => {
            cy.log(`Response Status: ${response.status}`);
            return cy.wrap(response);
        });
});

Cypress.Commands.add("apiGetProductsByCategory", (categoryId) => {
    return cy
        .request({
            method: "GET",
            url: `${API_BASE}/categories/${categoryId}/products`,
            failOnStatusCode: false,
            timeout: Cypress.env("apiTimeout") || 10000,
        })
        .then((response) => {
            cy.log(`Response Status: ${response.status}`);
            cy.log(`Total Products: ${response.body?.length || 0}`);
            return cy.wrap(response);
        });
});

Cypress.Commands.add("validateCategorySchema", (category) => {
    const valid = validateCategory(category);
    if (!valid) {
        throw new Error(
            `Category schema failed:\n${ajv.errorsText(validateCategory.errors, { separator: "\n" })}`,
        );
    }
    cy.log("Category schema passed");
});

Cypress.Commands.add("validateProductSchema", (product) => {
    const valid = validateProduct(product);
    if (!valid) {
        throw new Error(
            `Product schema failed:\n${ajv.errorsText(validateProduct.errors, { separator: "\n" })}`,
        );
    }
    cy.log("Product schema passed");
});
