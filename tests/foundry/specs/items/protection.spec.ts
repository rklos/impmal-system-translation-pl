import { expect, test } from '../../fixtures';
import { ItemSheetPage } from '../../pages/item-sheet-page';

test('shows translated item slots and the compact trait editor', async ({
  foundryPage,
}) => {
  const itemSheet = new ItemSheetPage(foundryPage);
  const item = await itemSheet.openDisposableProtection();

  try {
    await expect(itemSheet.emptySlot(item.applicationId)).toBeVisible();

    await itemSheet.openTraits(item.applicationId);
    await expect(itemSheet.traitLabel().first())
      .toHaveCSS('min-width', 'fit-content');
    await expect(itemSheet.traitValueInput().first())
      .toHaveCSS('flex-basis', '50px');
  } finally {
    await itemSheet.closeAndDelete(item.itemId);
  }
});
