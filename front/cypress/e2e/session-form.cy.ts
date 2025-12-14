describe('Session form spec', () => {
  const mockTeachers = [
    {
      id: 1,
      lastName: 'Smith',
      firstName: 'Jane',
      createdAt: '2024-01-01T00:00:00',
      updatedAt: '2024-01-01T00:00:00'
    },
    {
      id: 2,
      lastName: 'Doe',
      firstName: 'John',
      createdAt: '2024-01-01T00:00:00',
      updatedAt: '2024-01-01T00:00:00'
    }
  ];

  describe('Create session', () => {
    it('should display create session form', () => {
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
      cy.intercept('GET', '/api/teacher', { body: mockTeachers });

      cy.get('input[formControlName=email]').type('yoga@studio.com');
      cy.get('input[formControlName=password]').type('test!1234{enter}{enter}');

      cy.url().should('include', '/sessions');

      cy.get('button').contains('Create').click();

      cy.contains('Create session').should('be.visible');
      cy.get('input[formControlName=name]').should('be.visible');
      cy.get('input[formControlName=date]').should('be.visible');
      cy.get('mat-select[formControlName=teacher_id]').should('be.visible');
      cy.get('textarea[formControlName=description]').should('be.visible');
    });

    it('should create a new session successfully', () => {
      const newSession = {
        id: 1,
        name: 'New Yoga Session',
        description: 'A new relaxing session',
        date: '2024-06-20T10:00:00',
        teacher_id: 1,
        users: [],
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00'
      };

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
      cy.intercept('GET', '/api/teacher', { body: mockTeachers });
      cy.intercept('POST', '/api/session', {
        statusCode: 200,
        body: newSession
      }).as('createSession');

      cy.get('input[formControlName=email]').type('yoga@studio.com');
      cy.get('input[formControlName=password]').type('test!1234{enter}{enter}');

      cy.url().should('include', '/sessions');

      cy.get('button').contains('Create').click();

      cy.get('input[formControlName=name]').type('New Yoga Session');
      cy.get('input[formControlName=date]').type('2024-06-20');
      cy.get('mat-select[formControlName=teacher_id]').click();
      cy.get('mat-option').first().click();
      cy.get('textarea[formControlName=description]').type('A new relaxing session');

      cy.intercept('GET', '/api/session', { body: [newSession] });
      cy.get('button[type=submit]').click();

      cy.wait('@createSession');
      cy.url().should('include', '/sessions');
    });

    it('should validate required fields', () => {
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
      cy.intercept('GET', '/api/teacher', { body: mockTeachers });

      cy.get('input[formControlName=email]').type('yoga@studio.com');
      cy.get('input[formControlName=password]').type('test!1234{enter}{enter}');

      cy.url().should('include', '/sessions');

      cy.get('button').contains('Create').click();

      cy.get('button[type=submit]').should('be.disabled');

      cy.get('input[formControlName=name]').type('Test Session');
      cy.get('button[type=submit]').should('be.disabled');

      cy.get('input[formControlName=date]').type('2024-06-20');
      cy.get('button[type=submit]').should('be.disabled');

      cy.get('mat-select[formControlName=teacher_id]').click();
      cy.get('mat-option').first().click();
      cy.get('button[type=submit]').should('be.disabled');

      cy.get('textarea[formControlName=description]').type('Test description');
      cy.get('button[type=submit]').should('not.be.disabled');
    });
  });

  describe('Update session', () => {
    const existingSession = {
      id: 1,
      name: 'Existing Session',
      description: 'Old description',
      date: '2024-06-15T10:00:00',
      teacher_id: 1,
      users: [2, 3],
      createdAt: '2024-01-01T00:00:00',
      updatedAt: '2024-01-01T00:00:00'
    };

    it('should display update session form with existing data', () => {
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

      cy.intercept('GET', '/api/session', { body: [existingSession] });
      cy.intercept('GET', '/api/session/1', { body: existingSession });
      cy.intercept('GET', '/api/teacher', { body: mockTeachers });

      cy.get('input[formControlName=email]').type('yoga@studio.com');
      cy.get('input[formControlName=password]').type('test!1234{enter}{enter}');

      cy.url().should('include', '/sessions');

      cy.contains('Edit').click();

      cy.contains('Update session').should('be.visible');
      cy.get('input[formControlName=name]').should('have.value', 'Existing Session');
      cy.get('textarea[formControlName=description]').should('have.value', 'Old description');
    });

    it('should update session successfully', () => {
      const updatedSession = {
        ...existingSession,
        name: 'Updated Session',
        description: 'Updated description'
      };

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

      cy.intercept('GET', '/api/session', { body: [existingSession] });
      cy.intercept('GET', '/api/session/1', { body: existingSession });
      cy.intercept('GET', '/api/teacher', { body: mockTeachers });
      cy.intercept('PUT', '/api/session/1', {
        statusCode: 200,
        body: updatedSession
      }).as('updateSession');

      cy.get('input[formControlName=email]').type('yoga@studio.com');
      cy.get('input[formControlName=password]').type('test!1234{enter}{enter}');

      cy.url().should('include', '/sessions');

      cy.contains('Edit').click();

      cy.get('input[formControlName=name]').clear().type('Updated Session');
      cy.get('textarea[formControlName=description]').clear().type('Updated description');

      cy.get('button[type=submit]').click();

      cy.wait('@updateSession');
      cy.url().should('include', '/sessions');
    });
  });

  describe('Non-admin access', () => {
    it('should redirect non-admin users trying to create session', () => {
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

      cy.intercept('GET', '/api/session', []);

      cy.get('input[formControlName=email]').type('user@studio.com');
      cy.get('input[formControlName=password]').type('test!1234{enter}{enter}');

      cy.url().should('include', '/sessions');

      cy.visit('/sessions/create');

      cy.url().should('eq', 'http://localhost:4200/login');
    });

    it('should redirect non-admin users trying to update session', () => {
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

      cy.intercept('GET', '/api/session', []);

      cy.get('input[formControlName=email]').type('user@studio.com');
      cy.get('input[formControlName=password]').type('test!1234{enter}{enter}');

      cy.url().should('include', '/sessions');

      cy.visit('/sessions/update/1');

      cy.url().should('eq', 'http://localhost:4200/login');
    });
  });
});
