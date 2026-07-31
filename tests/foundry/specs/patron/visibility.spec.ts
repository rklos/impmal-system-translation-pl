import { expect, test } from '../../fixtures';
import { PatronSheetPage } from '../../pages/patron-sheet-page';

test('shows translated patron-liability visibility tooltips', async ({
  foundryPage,
}) => {
  const patronSheet = new PatronSheetPage(foundryPage);
  const patron = await patronSheet.openDisposablePatron();

  try {
    await expect(patronSheet.hiddenLiability(patron.applicationId))
      .toHaveAttribute('data-tooltip', 'Niewidoczne dla Graczy');
    await expect(patronSheet.visibleLiability(patron.applicationId))
      .toHaveAttribute('data-tooltip', 'Widoczne dla Graczy');
    await expect(patronSheet.factionVisibility(patron.applicationId, 'hidden'))
      .toHaveAttribute('data-tooltip', 'Niewidoczne dla Graczy');
    await expect(patronSheet.factionVisibility(patron.applicationId, 'visible'))
      .toHaveAttribute('data-tooltip', 'Widoczne dla Graczy');

    await patronSheet.expandFaction(patron.applicationId, 'visible');
    await expect(patronSheet.addSource(patron.applicationId, 'visible'))
      .toHaveText('Dodaj Źródło');
  } finally {
    await patronSheet.closeAndDelete(patron.actorId);
  }
});
