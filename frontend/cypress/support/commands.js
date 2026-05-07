// 清空 test DB 裡所有 bugs（每個 it 開頭跑，避免測試之間互相干擾）
Cypress.Commands.add('wipeBugs', () => {
  const api = Cypress.env('apiUrl');
  cy.request(`${api}/api/bugs`).then((res) => {
    res.body.forEach((bug) => {
      cy.request('DELETE', `${api}/api/bugs/${bug.id}`);
    });
  });
});

// 直接打 API 種一筆 bug（比走 UI 快、給「前置條件」用）
Cypress.Commands.add('seedBug', (overrides = {}) => {
  const api = Cypress.env('apiUrl');
  return cy.request('POST', `${api}/api/bugs`, {
    title: 'E2E Seed Bug',
    severity: 'MAJOR',
    reporter: 'E2E',
    ...overrides,
  });
});
