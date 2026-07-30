import { expect, test } from '../../fixtures';
import { PatronSheetPage } from '../../pages/patron-sheet-page';

test('shows translated patron-liability visibility tooltips', async ({
  foundryPage,
}) => {
  const patronSheet = new PatronSheetPage(foundryPage);
  const patron = await patronSheet.openDisposablePatron();

  try {
    await expect(patronSheet.hiddenLiability(patron.applicationId)).toBeVisible();
    await expect(patronSheet.visibleLiability(patron.applicationId)).toBeVisible();
    await expect(patronSheet.hiddenFaction(patron.applicationId)).toBeVisible();
    await expect(patronSheet.visibleFaction(patron.applicationId)).toBeVisible();

    await patronSheet.expandFaction(patron.applicationId, 'Widoczna frakcja');
    await expect(patronSheet.addSource(patron.applicationId, 'visible')).toBeVisible();
  } finally {
    await patronSheet.closeAndDelete(patron.actorId);
  }
});
