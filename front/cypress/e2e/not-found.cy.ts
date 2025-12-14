describe('Not Found spec', () => {
  it('should display 404 page for invalid route', () => {
    cy.visit('/invalid-route');
    cy.contains('Page not found !').should('be.visible');
  });

  it('should display 404 page for random URL', () => {
    cy.visit('/this/does/not/exist');
    cy.contains('Page not found !').should('be.visible');
  });

  it('should have correct styling on 404 page', () => {
    cy.visit('/not-found');
    cy.get('h1').should('be.visible');
  });
});
