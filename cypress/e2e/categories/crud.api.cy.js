describe("Platzi FakeAPI | Categories API - Core CRUD", () => {
    let testData;
    let createdCategoryId = null;

    before(() => {
        cy.fixture("categories").then((data) => {
            testData = data;
        });
    });

    after(() => {
        if (createdCategoryId) {
            cy.log(`Cleanup: Deleting test category ID ${createdCategoryId}`);
            cy.apiDeleteCategory(createdCategoryId);
        }
    });

    it("[CAT-CRUD-001]/categories - Should return list of all categories with valid schema", () => {
        cy.apiGetCategories().then((response) => {
            expect(response.status).to.eq(testData.expectedStatus.success);

            expect(response.body).to.be.an("array");
            expect(response.body.length).to.be.greaterThan(0);

            // Schema Validation on First Item
            const firstCategory = response.body[0];
            cy.validateCategorySchema(firstCategory);

            // Data Integrity Checks
            expect(firstCategory.id).to.be.a("number");
            expect(firstCategory.name).to.be.a("string");
            expect(firstCategory.slug).to.be.a("string");
            expect(firstCategory.image)
                .to.be.a("string")
                .and.to.include("http");
        });
    });

    it("[CAT-CRUD-002]/categories/ - Should create new category successfully", () => {
        const newCategory = {
            name: `${testData.testData.newCategory.name}`,
            image: testData.testData.newCategory.image,
        };

        cy.apiCreateCategory(newCategory).then((response) => {
            expect(response.status).to.eq(testData.expectedStatus.created);
            expect(response.body).to.be.an("object");

            // Store ID for cleanup and further tests
            createdCategoryId = response.body.id;

            expect(response.body.id).to.be.a("number").and.to.be.greaterThan(0);
            expect(response.body.name).to.eq(newCategory.name);
            expect(response.body.image).to.eq(newCategory.image);
            expect(response.body.slug).to.be.a("string");
            expect(response.body.slug).to.include("test-category");
        });
    });

    it("[CAT-CRUD-003]/categories/{id} - Should return specific category by ID", () => {
        cy.apiGetCategoryById(createdCategoryId).then((response) => {
            expect(response.status).to.eq(testData.expectedStatus.success);
            expect(response.body).to.be.an("object");

            cy.validateCategorySchema(response.body);
            // Specific Data Validation
            expect(response.body.id).to.eq(createdCategoryId);
            expect(response.body.name).to.eq(
                testData.testData.newCategory.name,
            );
            expect(response.body.slug).to.eq(
                testData.testData.newCategory.slug,
            );
        });
    });

    it("[CAT-CRUD-004]/categories/slug/{slug} - Should return category by slug", () => {
        cy.apiGetCategoryBySlug(testData.testData.newCategory.slug).then(
            (response) => {
                expect(response.status).to.eq(testData.expectedStatus.success);
                expect(response.body).to.be.an("object");

                cy.validateCategorySchema(response.body);

                // Slug-specific Validation
                expect(response.body.slug).to.eq(
                    testData.testData.newCategory.slug,
                );
                expect(response.body.name).to.eq(
                    testData.testData.newCategory.name,
                );
            },
        );
    });

    it("[CAT-CRUD-005]/categories/{id} - Should update existing category", () => {
        const updateData = {
            name: `${testData.testData.updateCategory.name}`,
            image: testData.testData.updateCategory.image,
        };

        cy.apiUpdateCategory(createdCategoryId, updateData).then((response) => {
            expect(response.status).to.eq(testData.expectedStatus.success);
            expect(response.body).to.be.an("object");

            cy.validateCategorySchema(response.body);

            // Update Verification
            expect(response.body.id).to.eq(createdCategoryId);
            expect(response.body.name).to.eq(updateData.name);
            expect(response.body.image).to.eq(updateData.image);
            expect(response.body.slug).to.include("updated-category");
        });
    });

    it("[CAT-CRUD-006]/categories/{id} - Should delete category successfully", () => {
        // First create a category specifically for deletion
        const categoryToDelete = {
            name: `${testData.testData.categoryToDelete.name}`,
            image: testData.testData.categoryToDelete.image,
        };

        cy.apiCreateCategory(categoryToDelete).then((createResponse) => {
            expect(createResponse.status).to.eq(
                testData.expectedStatus.created,
            );
            const deleteId = createResponse.body.id;

            cy.apiDeleteCategory(deleteId).then((deleteResponse) => {
                expect(deleteResponse.status).to.be.oneOf([
                    testData.expectedStatus.success,
                    testData.expectedStatus.noContent,
                ]);

                // Verify deletion by trying to GET
                cy.apiGetCategoryById(deleteId).then((verifyResponse) => {
                    expect(verifyResponse.status).to.be.oneOf([
                        testData.expectedStatus.notFound,
                        testData.expectedStatus.badRequest,
                        testData.expectedStatus.serverError,
                    ]);
                });
            });
        });
    });

    it("[CAT-CRUD-007]/categories/{id}/products - Should return products for category", () => {
        cy.apiGetProductsByCategory(1).then((response) => {
            expect(response.status).to.eq(testData.expectedStatus.success);
            expect(response.body).to.be.an("array");

            cy.log(`Found ${response.body.length} products in category 1`);

            // If products exist, validate schema
            if (response.body.length > 0) {
                const firstProduct = response.body[0];
                cy.validateProductSchema(firstProduct);

                expect(firstProduct.category).to.have.property("id", 1);
                expect(firstProduct.images).to.be.an("array");
            }
        });
    });

    it("[CAT-CRUD-008] GET /categories/{invalidId} - Should return error for non-existent ID", () => {
        cy.apiGetCategoryById(99999).then((response) => {
            expect(response.status).to.be.oneOf([
                testData.expectedStatus.badRequest,
                testData.expectedStatus.notFound,
                testData.expectedStatus.serverError,
            ]);
        });
    });

    it("[CAT-CRUD-009] GET /categories/slug/{invalidSlug} - Should return error", () => {
        cy.apiGetCategoryBySlug("this-slug-does-not-exist-12345").then(
            (response) => {
                expect(response.status).to.be.oneOf([
                    testData.expectedStatus.badRequest,
                    testData.expectedStatus.notFound,
                    testData.expectedStatus.serverError,
                ]);
            },
        );
    });

    it("[CAT-CRUD-010] POST /categories/ - Should reject invalid category data", () => {
        cy.apiCreateCategory(testData.testData.invalidCategory).then(
            (response) => {
                expect(response.status).to.be.oneOf([
                    testData.expectedStatus.badRequest,
                    testData.expectedStatus.serverError,
                ]);
            },
        );
    });
});
