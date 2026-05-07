describe('建立 Bug 完整流程', () => {
  const api = () => Cypress.env('apiUrl');

  beforeEach(() => {
    cy.wipeBugs();
  });

  it('從列表頁進入新增頁、填表送出後，能在列表看到新 Bug', () => {
    cy.intercept('POST', `${api()}/api/bugs`).as('createBug');
    cy.intercept('GET', `${api()}/api/bugs*`).as('listBugs');

    cy.visit('/');
    cy.wait('@listBugs');

    cy.contains('a', '+ 新增 Bug').click();
    cy.url().should('include', '/bugs/new');

    cy.get('#title').type('E2E 建立流程驗證');
    cy.get('#actual').type('打開 App 直接 crash');
    cy.get('#expected').type('正常顯示首頁');
    cy.get('#severity').select('CRITICAL');
    cy.get('#reporter').type('Cypress');

    cy.contains('button', '新增 Bug').click();
    cy.wait('@createBug').its('response.statusCode').should('eq', 201);

    cy.url().should('match', /\/$/);
    cy.wait('@listBugs');

    cy.contains('tr', 'E2E 建立流程驗證').within(() => {
      cy.contains('緊急').should('exist');
      cy.contains('待處理').should('exist');
    });
  });

  it('從詳情頁刪除 Bug 後，列表不再顯示這筆', () => {
    cy.seedBug({ title: 'E2E 待刪 Bug' });
    cy.intercept('DELETE', `${api()}/api/bugs/*`).as('deleteBug');

    cy.visit('/');
    cy.contains('tr', 'E2E 待刪 Bug').click();
    cy.url().should('match', /\/bugs\/[\w-]+$/);

    cy.on('window:confirm', () => true);
    cy.contains('button', '刪除').click();
    cy.wait('@deleteBug').its('response.statusCode').should('eq', 204);

    cy.url().should('match', /\/$/);
    cy.contains('E2E 待刪 Bug').should('not.exist');
  });
});
