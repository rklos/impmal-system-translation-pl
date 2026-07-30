import { expect, test } from '../../fixtures';
import { ThemeConfigPage } from '../../pages/theme-config-page';

test('shows patched Polish labels in theme configuration', async ({
  foundryPage,
}) => {
  const themeConfig = new ThemeConfigPage(foundryPage);
  await themeConfig.open();

  try {
    await expect(themeConfig.enabledLabel()).toBeVisible();
    await expect(themeConfig.fontLabel()).toBeVisible();
    await expect(themeConfig.effectScanLabel()).toBeVisible();
  } finally {
    await themeConfig.close();
  }
});
