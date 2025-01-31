// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('login', (email, password) => {
    cy.visit('http://127.0.0.1:5500/index.html'); 
    cy.get('#loginSwitch').click();
    cy.get('#login-email').type(email); 
    cy.get('#login-password').type(password);
    cy.get('#login').click(); 
  });
  

Cypress.Commands.add('adminLogin', (email, password) => {
    cy.visit('http://127.0.0.1:5500/index.html');
    cy.get('#openModal').click();
    cy.get('[data-cy="admin-email"]').type(email);
    cy.get('[data-cy="admin-password"]').type(password);
    cy.get('[data-cy="admin-login"]').click();

})