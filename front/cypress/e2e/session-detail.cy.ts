describe('Session detail spec', () => {
  const mockSession = {
    id: 1,
    name: 'Morning Yoga',
    description: 'Start your day with energy and mindfulness',
    date: '2024-06-15T10:00:00',
    teacher_id: 1,
    users: [2, 3],
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00'
  };

  const mockTeacher = {
    id: 1,
    lastName: 'Smith',
    firstName: 'Jane',
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00'
  };

  it('should display session details', () => {
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

    cy.intercept('GET', '/api/session', { body: [mockSession] });
    cy.intercept('GET', '/api/session/1', { body: mockSession });
    cy.intercept('GET', '/api/teacher/1', { body: mockTeacher });

    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('input[formControlName=password]').type('test!1234{enter}{enter}');

    cy.url().should('include', '/sessions');

    cy.contains('Detail').click();

    cy.contains('Morning Yoga').should('be.visible');
    cy.contains('Start your day with energy and mindfulness').should('be.visible');
    cy.contains('Jane SMITH').should('be.visible');
    cy.contains('2 attendees').should('be.visible');
  });

  it('should allow admin to delete session', () => {
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

    cy.intercept('GET', '/api/session', { body: [mockSession] });
    cy.intercept('GET', '/api/session/1', { body: mockSession });
    cy.intercept('GET', '/api/teacher/1', { body: mockTeacher });
    cy.intercept('DELETE', '/api/session/1', { statusCode: 200 });

    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('input[formControlName=password]').type('test!1234{enter}{enter}');

    cy.url().should('include', '/sessions');

    cy.contains('Detail').click();

    cy.intercept('GET', '/api/session', { body: [] });
    cy.get('button').contains('Delete').should('be.visible').click();
    cy.url().should('include', '/sessions');
  });

  it('should allow user to participate in session', () => {
    const userSession = { ...mockSession, users: [] };
    const updatedSession = { ...mockSession, users: [2] };

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

    cy.intercept('GET', '/api/session', { body: [userSession] });
    cy.intercept('GET', '/api/session/1', { body: userSession }).as('initialSession');
    cy.intercept('GET', '/api/teacher/1', { body: mockTeacher });
    cy.intercept('POST', '/api/session/1/participate/2', { statusCode: 200 }).as('participate');

    cy.get('input[formControlName=email]').type('user@studio.com');
    cy.get('input[formControlName=password]').type('test!1234{enter}{enter}');

    cy.url().should('include', '/sessions');

    cy.contains('Detail').click();

    cy.intercept('GET', '/api/session/1', { body: updatedSession }).as('updatedSession');
    cy.get('button').contains('Participate').should('be.visible').click();

    cy.wait('@participate');
    cy.wait('@updatedSession');
  });

  it('should allow user to unparticipate from session', () => {
    const userSession = { ...mockSession, users: [2] };
    const updatedSession = { ...mockSession, users: [] };

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

    cy.intercept('GET', '/api/session', { body: [userSession] });
    cy.intercept('GET', '/api/session/1', { body: userSession }).as('initialSession');
    cy.intercept('GET', '/api/teacher/1', { body: mockTeacher });
    cy.intercept('DELETE', '/api/session/1/participate/2', { statusCode: 200 }).as('unparticipate');

    cy.get('input[formControlName=email]').type('user@studio.com');
    cy.get('input[formControlName=password]').type('test!1234{enter}{enter}');

    cy.url().should('include', '/sessions');

    cy.contains('Detail').click();

    cy.intercept('GET', '/api/session/1', { body: updatedSession }).as('updatedSession');
    cy.get('button').contains('Do not participate').should('be.visible').click();

    cy.wait('@unparticipate');
    cy.wait('@updatedSession');
  });

  it('should navigate back on back button click', () => {
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

    cy.intercept('GET', '/api/session', { body: [mockSession] });
    cy.intercept('GET', '/api/session/1', { body: mockSession });
    cy.intercept('GET', '/api/teacher/1', { body: mockTeacher });

    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('input[formControlName=password]').type('test!1234{enter}{enter}');

    cy.url().should('include', '/sessions');

    cy.contains('Detail').click();

    cy.get('button[mat-icon-button]').first().click();
    cy.url().should('not.include', '/detail');
  });

  it('should not show participate button for admin users', () => {
    const adminSession = { ...mockSession, users: [] };

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

    cy.intercept('GET', '/api/session', { body: [adminSession] });
    cy.intercept('GET', '/api/session/1', { body: adminSession });
    cy.intercept('GET', '/api/teacher/1', { body: mockTeacher });

    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('input[formControlName=password]').type('test!1234{enter}{enter}');

    cy.url().should('include', '/sessions');

    cy.contains('Detail').click();

    cy.get('button').contains('Participate').should('not.exist');
    cy.get('button').contains('Delete').should('be.visible');
  });

  it('should not show delete button for non-admin users', () => {
    const userSession = { ...mockSession, users: [] };

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

    cy.intercept('GET', '/api/session', { body: [userSession] });
    cy.intercept('GET', '/api/session/1', { body: userSession });
    cy.intercept('GET', '/api/teacher/1', { body: mockTeacher });

    cy.get('input[formControlName=email]').type('user@studio.com');
    cy.get('input[formControlName=password]').type('test!1234{enter}{enter}');

    cy.url().should('include', '/sessions');

    cy.contains('Detail').click();

    cy.get('button').contains('Delete').should('not.exist');
    cy.get('button').contains('Participate').should('be.visible');
  });
});
