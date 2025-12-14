describe('Logout spec', () => {
  beforeEach(() => {
    cy.visit('/login');

    cy.intercept('POST', '/api/auth/login', {
      body: {
        id: 1,
        username: 'yoga@studio.com',
        firstName: 'Admin',
        lastName: 'User',
        admin: true
      }
    });

    cy.intercept('GET', '/api/session', []).as('session');

    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('input[formControlName=password]').type('test!1234{enter}{enter}');

    cy.url().should('include', '/sessions');
  });

  it('should logout successfully', () => {
    cy.contains('Logout').should('be.visible');
    cy.contains('Logout').click();

    cy.url().should('eq', Cypress.config().baseUrl);
    cy.contains('Login').should('be.visible');
    cy.contains('Register').should('be.visible');
  });

  it('should hide menu items after logout', () => {
    cy.contains('Sessions').should('be.visible');
    cy.contains('Account').should('be.visible');

    cy.contains('Logout').click();

    cy.contains('Sessions').should('not.exist');
    cy.contains('Account').should('not.exist');
    cy.contains('Logout').should('not.exist');
  });

  it('should not allow accessing protected routes after logout', () => {
    cy.contains('Logout').click();

    cy.visit('/sessions');
    cy.url().should('include', '/login');
  });

  it('should show login and register buttons after logout', () => {
    cy.contains('Logout').click();

    cy.contains('Login').should('be.visible');
    cy.contains('Register').should('be.visible');
  });
});
