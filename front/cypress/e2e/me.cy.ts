describe('User profile (Me) spec', () => {
  const mockUser = {
    id: 1,
    email: 'yoga@studio.com',
    lastName: 'Admin',
    firstName: 'User',
    admin: true,
    password: 'password',
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00'
  };

  beforeEach(() => {
    cy.visit('/login');

    cy.intercept('POST', '/api/auth/login', {
      body: {
        id: 1,
        username: 'yoga@studio.com',
        firstName: 'User',
        lastName: 'Admin',
        admin: true
      }
    });

    cy.intercept('GET', '/api/session', []).as('session');

    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('input[formControlName=password]').type('test!1234{enter}{enter}');

    cy.url().should('include', '/sessions');
  });

  it('should display user information', () => {
    cy.intercept('GET', '/api/user/1', { body: mockUser }).as('user');

    cy.contains('Account').click();
    cy.wait('@user');

    cy.contains('User information').should('be.visible');
    cy.contains('Name: User ADMIN').should('be.visible');
    cy.contains('Email: yoga@studio.com').should('be.visible');
    cy.contains('You are admin').should('be.visible');
  });

  it('should display non-admin user correctly', () => {
    const regularUser = { ...mockUser, id: 2, admin: false };

    cy.visit('/login');

    cy.intercept('POST', '/api/auth/login', {
      body: {
        id: 2,
        username: 'user@studio.com',
        firstName: 'Regular',
        lastName: 'User',
        admin: false
      }
    });

    cy.intercept('GET', '/api/session', []).as('session');

    cy.get('input[formControlName=email]').type('user@studio.com');
    cy.get('input[formControlName=password]').type('test!1234{enter}{enter}');

    cy.url().should('include', '/sessions');

    cy.intercept('GET', '/api/user/2', { body: regularUser });

    cy.contains('Account').click();

    cy.contains('You are admin').should('not.exist');
  });

  it('should not show delete button for admin users', () => {
    cy.intercept('GET', '/api/user/1', { body: mockUser });

    cy.contains('Account').click();

    cy.get('button').contains('Detail').should('not.exist');
  });

  it('should navigate back on back button click', () => {
    cy.intercept('GET', '/api/user/1', { body: mockUser });

    cy.contains('Account').click();

    cy.get('button[mat-icon-button]').first().click();
    cy.url().should('not.include', '/me');
  });

  it('should display created date', () => {
    cy.intercept('GET', '/api/user/1', { body: mockUser });

    cy.contains('Account').click();

    cy.contains('Create at').should('be.visible');
  });

  it('should display last update date', () => {
    cy.intercept('GET', '/api/user/1', { body: mockUser });

    cy.contains('Account').click();

    cy.contains('Last update').should('be.visible');
  });

  it('should allow non-admin user to delete account', () => {
    const regularUser = { ...mockUser, id: 2, admin: false };

    cy.visit('/login');

    cy.intercept('POST', '/api/auth/login', {
      body: {
        id: 2,
        username: 'user@studio.com',
        firstName: 'Regular',
        lastName: 'User',
        admin: false
      }
    });

    cy.intercept('GET', '/api/session', []).as('session');

    cy.get('input[formControlName=email]').type('user@studio.com');
    cy.get('input[formControlName=password]').type('test!1234{enter}{enter}');

    cy.url().should('include', '/sessions');

    cy.intercept('GET', '/api/user/2', { body: regularUser });
    cy.intercept('DELETE', '/api/user/2', { statusCode: 200 }).as('deleteUser');

    cy.contains('Account').click();

    cy.get('button').contains('Detail').should('be.visible').click();

    cy.wait('@deleteUser');
    cy.url().should('eq', 'http://localhost:4200/');
  });
});
