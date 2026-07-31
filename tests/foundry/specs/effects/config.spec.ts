import { expect, test } from '../../fixtures';
import { EffectConfigPage } from '../../pages/effect-config-page';

test('shows translated effect configuration labels', async ({ foundryPage }) => {
  const effectConfig = new EffectConfigPage(foundryPage);
  const effect = await effectConfig.openDisposableZoneEffect();

  try {
    await effectConfig.selectScripts(effect.applicationId);
    await expect(effectConfig.scriptTrigger(effect.applicationId))
      .toHaveText('Oblicz Cechy');

    await effectConfig.openAdvancedConfig(effect.applicationId);
    await expect(effectConfig.zoneTraits()).toContainText('Cechy Strefy');
  } finally {
    await effectConfig.closeAndDelete(effect.actorId);
  }
});
