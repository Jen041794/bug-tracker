describe('附件上傳 / 刪除流程', () => {
  const api = () => Cypress.env('apiUrl');

  // Smallest valid 1x1 PNG so we can simulate a real file picker without an asset on disk.
  const TINY_PNG_BASE64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8//8/AwAI/AL+nVjizQAAAABJRU5ErkJggg==';

  beforeEach(() => {
    cy.wipeBugs();
    cy.seedBug({ title: 'E2E 待加附件 Bug' }).as('seedRes');
  });

  it('進詳情頁 → 上傳圖片 → 縮圖出現 → 刪除 → 縮圖消失', function () {
    const bugId = this.seedRes.body.id;
    const fakeUrl = 'https://supabase.example.com/fake-screenshot.png';

    // Stub Supabase upload (the route returns the persisted attachment row, but in E2E
    // we don't actually want to write to Supabase). Cypress intercepts the *outgoing*
    // call to our backend and replaces the response.
    cy.intercept('POST', `${api()}/api/bugs/${bugId}/attachments`, (req) => {
      req.reply({
        statusCode: 201,
        body: {
          id: 'fake-attachment-id',
          bugId,
          url: fakeUrl,
          storageKey: `${bugId}/fake-key.png`,
          filename: 'screenshot.png',
          mimeType: 'image/png',
          size: 70,
          uploadedAt: new Date().toISOString(),
        },
      });
    }).as('uploadAttachment');

    cy.intercept('GET', `${api()}/api/bugs/${bugId}`).as('getBug');
    cy.intercept('DELETE', `${api()}/api/attachments/*`, { statusCode: 204 }).as(
      'deleteAttachment'
    );

    cy.visit(`/bugs/${bugId}`);
    cy.wait('@getBug');

    cy.contains('尚未加入任何附件').should('be.visible');

    // Drive the hidden file input directly with a synthesized file.
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from(TINY_PNG_BASE64, 'base64'),
        fileName: 'screenshot.png',
        mimeType: 'image/png',
      },
      { force: true }
    );

    cy.wait('@uploadAttachment').its('response.statusCode').should('eq', 201);

    cy.get(`img[alt="screenshot.png"]`).should('be.visible');
    cy.contains('尚未加入任何附件').should('not.exist');

    cy.on('window:confirm', () => true);
    cy.contains('button', '×').click();
    cy.wait('@deleteAttachment').its('response.statusCode').should('eq', 204);

    cy.get(`img[alt="screenshot.png"]`).should('not.exist');
    cy.contains('尚未加入任何附件').should('be.visible');
  });
});
