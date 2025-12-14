describe('Login spec', () => {
  it('Login successfull', () => {
    cy.visit('/login')

    cy.intercept('POST', '/api/auth/login', {
      body: {
        id: 1,
        username: 'userName',
        firstName: 'firstName',
        lastName: 'lastName',
        admin: true
      },
    })

    cy.intercept(
      {
        method: 'GET',
        url: '/api/session',
      },
      []).as('session')

    cy.get('input[formControlName=email]').type("yoga@studio.com")
    cy.get('input[formControlName=password]').type(`${"test!1234"}{enter}{enter}`)

    cy.url().should('include', '/sessions')
  })

  it('should display error on invalid credentials', () => {
    cy.visit('/login')

    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { message: 'Invalid credentials' }
    })

    cy.intercept('GET', '/api/session', [])

    cy.get('input[formControlName=email]').type("wrong@studio.com")
    cy.get('input[formControlName=password]').type("wrongpassword{enter}{enter}")

    cy.get('.error').should('be.visible')
    cy.url().should('include', '/login')
  })

  it('should validate email format', () => {
    cy.visit('/login')

    cy.get('button[type=submit]').should('be.disabled')

    cy.get('input[formControlName=email]').type('invalid-email')
    cy.get('input[formControlName=password]').type('test!1234')

    cy.get('button[type=submit]').should('be.disabled')

    cy.get('input[formControlName=email]').clear().type('valid@email.com')

    cy.get('button[type=submit]').should('not.be.disabled')
  })

  it('should require all fields', () => {
    cy.visit('/login')

    cy.get('button[type=submit]').should('be.disabled')

    cy.get('input[formControlName=email]').type('test@test.com')
    cy.get('button[type=submit]').should('be.disabled')

    cy.get('input[formControlName=password]').type('password')
    cy.get('button[type=submit]').should('not.be.disabled')
  })
});