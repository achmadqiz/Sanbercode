describe("Platzi FakeAPI | Categories API - Core CRUD (7+ Requests)", () => {
  let testData;
  let createdCategoryId = null;
  let createdCategorySlug = null;

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

  it("[API-001] GET /categories - Should return list of all categories with valid schema", () => {
    cy.apiGetCategories().then((response) => {
      expect(response.status).to.eq(testData.expectedStatus.success);

      expect(response.body).to.be.an("array");
      expect(response.body.length).to.be.greaterThan(0);

      // Schema Validation on First Item
      const firstCategory = response.body[0];
      cy.log("testes====================\n\n\n", firstCategory);
      cy.validateCategorySchema(firstCategory);

      // Data Integrity Checks
      expect(firstCategory.id).to.be.a("number");
      expect(firstCategory.name).to.be.a("string");
      expect(firstCategory.slug).to.be.a("string");
      expect(firstCategory.image).to.be.a("string").and.to.include("http");
    });
  });

  it("[API-004] POST /categories/ - Should create new category successfully", () => {
    const newCategory = {
      name: `${testData.testData.newCategory.name}`,
      image: testData.testData.newCategory.image,
    };

    cy.apiCreateCategory(newCategory).then((response) => {
      expect(response.status).to.eq(testData.expectedStatus.created);
      expect(response.body).to.be.an("object");

      // Store ID for cleanup and further tests
      createdCategoryId = response.body.id;
      createdCategorySlug = response.body.slug;

      expect(response.body.id).to.be.a("number").and.to.be.greaterThan(0);
      expect(response.body.name).to.eq(newCategory.name);
      expect(response.body.image).to.eq(newCategory.image);
      expect(response.body.slug).to.be.a("string");
      expect(response.body.slug).to.include("test-category");
    });
  });

  it("[API-002] GET /categories/{id} - Should return specific category by ID", () => {
    cy.apiGetCategoryById(createdCategoryId).then((response) => {
      expect(response.status).to.eq(testData.expectedStatus.success);
      expect(response.body).to.be.an("object");

      cy.validateCategorySchema(response.body);
      cy.log("============")
      cy.log(testData.testData.newCategory.name) 
      // Specific Data Validation
      expect(response.body.id).to.eq(createdCategoryId);
      expect(response.body.name).to.eq(testData.testData.newCategory.name);
      expect(response.body.slug).to.eq(testData.testData.newCategory.slug);
    });
  });

  it("[API-003] GET /categories/slug/{slug} - Should return category by slug", () => {
    cy.apiGetCategoryBySlug(testData.testData.newCategory.slug).then((response) => {
      expect(response.status).to.eq(testData.expectedStatus.success);
      expect(response.body).to.be.an("object");

      cy.validateCategorySchema(response.body);

      // Slug-specific Validation
      expect(response.body.slug).to.eq(testData.testData.newCategory.slug);
      expect(response.body.name).to.eq(testData.testData.newCategory.name);
    });
  });

  it("[API-005] PUT /categories/{id} - Should update existing category", () => {
    const updateData = {
      name: `${testData.testData.updateCategory.name}`,
      image: testData.testData.updateCategory.image,
    };

    // Using ID 2 for update (safe to modify)
    cy.apiUpdateCategory(2, updateData).then((response) => {
      expect(response.status).to.eq(testData.expectedStatus.success);
      expect(response.body).to.be.an("object");

      cy.validateCategorySchema(response.body);

      // Update Verification
      expect(response.body.id).to.eq(2);
      expect(response.body.name).to.eq(updateData.name);
      expect(response.body.image).to.eq(updateData.image);
      expect(response.body.slug).to.include("updated-category");
    });
  });

  it("[API-006] DELETE /categories/{id} - Should delete category successfully", () => {
    // First create a category specifically for deletion
    const categoryToDelete = {
      name: `${testData.testData.categoryToDelete.name}`,
      image: testData.testData.categoryToDelete.image,
    };

    cy.apiCreateCategory(categoryToDelete).then((createResponse) => {
      expect(createResponse.status).to.eq(testData.expectedStatus.created);
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

  it("[API-007] GET /categories/{id}/products - Should return products for category", () => {
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

  it("[API-NEG-001] GET /categories/{invalidId} - Should return error for non-existent ID", () => {
    cy.apiGetCategoryById(99999).then((response) => {
      expect(response.status).to.be.oneOf([
        testData.expectedStatus.badRequest,
        testData.expectedStatus.notFound,
        testData.expectedStatus.serverError,
      ]);
    });
  });

  it("[API-NEG-002] GET /categories/slug/{invalidSlug} - Should return error", () => {
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

  it("[API-NEG-003] POST /categories/ - Should reject invalid category data", () => {
    cy.apiCreateCategory(testData.testData.invalidCategory).then((response) => {
      expect(response.status).to.be.oneOf([
        testData.expectedStatus.badRequest,
        testData.expectedStatus.serverError,
      ]);
    });
  });
});
