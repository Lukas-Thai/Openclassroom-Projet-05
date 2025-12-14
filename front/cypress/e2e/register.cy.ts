describe('Register spec', () => {
  it('should register successfully', () => {
    cy.visit('/register');

    cy.intercept('POST', '/api/auth/register', {
      statusCode: 200
    }).as('register');

    cy.get('input[formControlName=firstName]').type('John');
    cy.get('input[formControlName=lastName]').type('Doe');
    cy.get('input[formControlName=email]').type('john.doe@example.com');
    cy.get('input[formControlName=password]').type('Password123!{enter}');

    cy.wait('@register');
    cy.url().should('include', '/login');
  });

  it('should show error on registration failure', () => {
    cy.visit('/register');

    cy.intercept('POST', '/api/auth/register', {
      statusCode: 400,
      body: { message: 'Email already exists' }
    }).as('registerError');

    cy.get('input[formControlName=firstName]').type('John');
    cy.get('input[formControlName=lastName]').type('Doe');
    cy.get('input[formControlName=email]').type('existing@example.com');
    cy.get('input[formControlName=password]').type('Password123!{enter}');

    cy.wait('@registerError');
    cy.get('.error').should('be.visible');
  });

  it('should validate form fields', () => {
    cy.visit('/register');

    cy.get('button[type=submit]').should('be.disabled');

    cy.get('input[formControlName=firstName]').type('John');
    cy.get('button[type=submit]').should('be.disabled');

    cy.get('input[formControlName=lastName]').type('Doe');
    cy.get('button[type=submit]').should('be.disabled');

    cy.get('input[formControlName=email]').type('invalid-email');
    cy.get('button[type=submit]').should('be.disabled');

    cy.get('input[formControlName=email]').clear().type('john@example.com');
    cy.get('button[type=submit]').should('be.disabled');

    cy.get('input[formControlName=password]').type('Password123!');
    cy.get('button[type=submit]').should('not.be.disabled');
  });
});
