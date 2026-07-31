import { expect, test } from '../../fixtures';
import { ThemeConfigPage } from '../../pages/theme-config-page';

test('shows patched Polish labels in theme configuration', async ({
  foundryPage,
}) => {
  const themeConfig = new ThemeConfigPage(foundryPage);
  await themeConfig.open();

  try {
    await expect(themeConfig.settingLabel('enabled')).toHaveText('Włączone');
    await expect(themeConfig.settingLabel('font')).toHaveText('Czcionka');
    await expect(themeConfig.settingLabel('scan')).toHaveText('Skan Efektów');
  } finally {
    await themeConfig.close();
  }
});
