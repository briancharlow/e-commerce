/// <reference types="Cypress" />

describe('user spec', () => {
  
 beforeEach(()=>{
  
 })
 //Test 1 Signup

  // it('signs up new user', () => {
  //   cy.get('#signup-name').type('test') 
  //   cy.get('#signup-email').type('briankyalo@gmail.com')
  //   cy.get('#signup-password').type('Brian@1324')
  //   cy.get('#register').click()
   
  // })


  //Test 2 Login
  it('logs in user', () => {
    cy.visit('http://127.0.0.1:5500/index.html')
    cy.get('#loginSwitch').click()
    cy.get('#login-email').type('briankyalo@gmail.com')
    cy.get('#login-password').type('Brian@1324')
    cy.get('#login').click()
  })

 
  
})



describe('add to cart', () => {
  beforeEach(()=>{
  cy.login('briankyalo@gmail.com', 'Brian@1324')
  })

  // Test 3 Add to cart
  it('Should add a specific item to cart', () => {
    cy.contains('.product-card h2', 'Scream').parent().find('.cart').click();
    cy.get('#cartCount').should('not.have.text', '0');

  })
//Test 4 navigate to cart
  it('Should navigate to the cart page', () => {
    cy.get('.cart-link').click()
    cy.url().should('include', '/cart')
  })

  // it("should remove a single item from the cart", () => {
  //   cy.get('.cart-link').click()
  //   cy.get(".cart-item").should("exist"); // Ensure there are items in the cart
  //   cy.get(".cart-item").first().find(".removeButton").click(); // Click the remove button
  //   cy.get(".cart-item").should("have.length.lessThan", 1); // Verify an item was removed
  //   cy.get("#Message").should("contain", "Item removed from your cart.");  // Verify item was removed
  // });

  //test 5 proceed to checkout
  it("should proceed to checkout", () => {
    cy.get('.cart-link').click()
    cy.get("#checkoutButton").click(); 
    cy.url().should("include", "artifacts.html"); 

  });
})

// admin

describe('admin spec', () => {
  beforeEach(() => {
    
    cy.adminLogin('admin@gmail.com', 'Admin@123');
    cy.visit('http://127.0.0.1:5500/admin.html'); 
  });

  // Test 6: Add a new product and verify the length of items

  it('should add a new product successfully', () => {
  
    cy.get('#title').type('Test Artwork')
    cy.get('#description').type('A beautiful test artwork description')
    cy.get('#artist').type('Test Artist')
    cy.get('#image').type('https://example.com/test-image.jpg')
    cy.get('#price').type('1000')

 
    cy.get('#productForm button[type="submit"]').click()


    cy.get('#Message')
      .should('be.visible')
      .and('contain', 'Product added successfully!')
      .and('have.class', 'success')

    
    cy.get('#productsTable tbody')
      .should('contain', 'Test Artwork')
      .and('contain', 'Test Artist')
      .and('contain', '1000')
  })
});