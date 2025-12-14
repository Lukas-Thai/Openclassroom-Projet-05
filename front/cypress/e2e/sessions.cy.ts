describe('Sessions list spec', () => {
  it('should display list of sessions', () => {
    const mockSessions = [
      {
        id: 1,
        name: 'Morning Yoga',
        description: 'Start your day with energy',
        date: '2024-06-01T10:00:00',
        teacher_id: 1,
        users: [1, 2, 3],
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00'
      },
      {
        id: 2,
        name: 'Evening Relaxation',
        description: 'Unwind after work',
        date: '2024-06-02T18:00:00',
        teacher_id: 2,
        users: [1, 4],
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00'
      }
    ];

    cy.visit('/login');

    cy.intercept('POST', '/api/auth/login', {
      body: {
        token: 'fake-jwt-token',
        type: 'Bearer',
        id: 1,
        username: 'yoga@studio.com',
        firstName: 'Admin',
        lastName: 'Admin',
        admin: true
      }
    });

    cy.intercept('GET', '/api/session', { body: mockSessions });

    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('input[formControlName=password]').type('test!1234{enter}{enter}');

    cy.url().should('include', '/sessions');

    cy.get('mat-card.item').should('have.length', 2);
    cy.contains('Morning Yoga').should('be.visible');
    cy.contains('Evening Relaxation').should('be.visible');
  });

  it('should show create button for admin users', () => {
    cy.visit('/login');

    cy.intercept('POST', '/api/auth/login', {
      body: {
        token: 'fake-jwt-token',
        type: 'Bearer',
        id: 1,
        username: 'yoga@studio.com',
        firstName: 'Admin',
        lastName: 'Admin',
        admin: true
      }
    });

    cy.intercept('GET', '/api/session', []);

    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('input[formControlName=password]').type('test!1234{enter}{enter}');

    cy.url().should('include', '/sessions');

    cy.get('button').contains('Create').should('be.visible');
  });

  it('should navigate to session detail on click', () => {
    const mockSessions = [
      {
        id: 1,
        name: 'Morning Yoga',
        description: 'Start your day',
        date: '2024-06-01T10:00:00',
        teacher_id: 1,
        users: [1],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }
    ];

    cy.visit('/login');

    cy.intercept('POST', '/api/auth/login', {
      body: {
        token: 'fake-jwt-token',
        type: 'Bearer',
        id: 1,
        username: 'yoga@studio.com',
        firstName: 'Admin',
        lastName: 'Admin',
        admin: true
      }
    });

    cy.intercept('GET', '/api/session', { body: mockSessions });
    cy.intercept('GET', '/api/session/1', { body: mockSessions[0] });
    cy.intercept('GET', '/api/teacher/1', {
      body: {
        id: 1,
        lastName: 'Smith',
        firstName: 'Jane',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }
    });

    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('input[formControlName=password]').type('test!1234{enter}{enter}');

    cy.url().should('include', '/sessions');

    cy.contains('Detail').should('be.visible').click();
    cy.url().should('include', '/sessions/detail/1');
  });

  it('should navigate to create session form', () => {
    cy.visit('/login');

    cy.intercept('POST', '/api/auth/login', {
      body: {
        token: 'fake-jwt-token',
        type: 'Bearer',
        id: 1,
        username: 'yoga@studio.com',
        firstName: 'Admin',
        lastName: 'Admin',
        admin: true
      }
    });

    cy.intercept('GET', '/api/session', []);
    cy.intercept('GET', '/api/teacher', { body: [] });

    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('input[formControlName=password]').type('test!1234{enter}{enter}');

    cy.url().should('include', '/sessions');

    cy.get('button').contains('Create').click();
    cy.url().should('include', '/sessions/create');
  });

  it('should not show create button for non-admin users', () => {
    const mockSessions = [
      {
        id: 1,
        name: 'Morning Yoga',
        description: 'Start your day with energy',
        date: '2024-06-01T10:00:00',
        teacher_id: 1,
        users: [2],
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00'
      }
    ];

    cy.visit('/login');

    cy.intercept('POST', '/api/auth/login', {
      body: {
        token: 'fake-jwt-token',
        type: 'Bearer',
        id: 2,
        username: 'user@studio.com',
        firstName: 'Regular',
        lastName: 'User',
        admin: false
      }
    });

    cy.intercept('GET', '/api/session', { body: mockSessions });

    cy.get('input[formControlName=email]').type('user@studio.com');
    cy.get('input[formControlName=password]').type('test!1234{enter}{enter}');

    cy.url().should('include', '/sessions');

    cy.get('button').contains('Create').should('not.exist');
    cy.contains('Morning Yoga').should('be.visible');
  });

  it('should not show edit button for non-admin users', () => {
    const mockSessions = [
      {
        id: 1,
        name: 'Morning Yoga',
        description: 'Start your day with energy',
        date: '2024-06-01T10:00:00',
        teacher_id: 1,
        users: [2],
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00'
      }
    ];

    cy.visit('/login');

    cy.intercept('POST', '/api/auth/login', {
      body: {
        token: 'fake-jwt-token',
        type: 'Bearer',
        id: 2,
        username: 'user@studio.com',
        firstName: 'Regular',
        lastName: 'User',
        admin: false
      }
    });

    cy.intercept('GET', '/api/session', { body: mockSessions });

    cy.get('input[formControlName=email]').type('user@studio.com');
    cy.get('input[formControlName=password]').type('test!1234{enter}{enter}');

    cy.url().should('include', '/sessions');

    cy.get('button').contains('Edit').should('not.exist');
    cy.contains('Detail').should('be.visible');
  });
});
