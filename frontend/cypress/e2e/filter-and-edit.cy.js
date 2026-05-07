describe('篩選 + 編輯狀態流程', () => {
  const api = () => Cypress.env('apiUrl');

  beforeEach(() => {
    cy.wipeBugs();
    cy.seedBug({ title: 'E2E Open Bug', severity: 'CRITICAL' });
    cy.seedBug({ title: 'E2E Closed Bug', severity: 'MINOR', status: 'CLOSED' });
  });

  it('用狀態篩選縮小範圍、進詳情改狀態、列表回看新狀態', () => {
    cy.intercept('GET', `${api()}/api/bugs*`).as('listBugs');
    cy.intercept('PATCH', `${api()}/api/bugs/*`).as('updateBug');

    cy.visit('/');
    cy.wait('@listBugs');

    cy.get('#filter-status').select('OPEN');
    cy.wait('@listBugs');
    cy.contains('E2E Open Bug').should('be.visible');
    cy.contains('E2E Closed Bug').should('not.exist');

    cy.contains('tr', 'E2E Open Bug').click();
    cy.url().should('match', /\/bugs\/[\w-]+$/);

    cy.contains('a', '編輯').click();
    cy.url().should('match', /\/bugs\/[\w-]+\/edit$/);
    cy.get('#status').select('IN_PROGRESS');
    cy.contains('button', '儲存變更').click();
    cy.wait('@updateBug').its('response.statusCode').should('eq', 200);

    cy.url().should('match', /\/$/);
    cy.get('#filter-status').select('');
    cy.wait('@listBugs');
    cy.contains('tr', 'E2E Open Bug').within(() => {
      cy.contains('處理中').should('exist');
    });
  });
});
