import { expect, test } from '../../fixtures';
import { d100, withForcedDice } from '../../helpers/dice-control';

test('forces a real Foundry d100 roll to the requested result', async ({
  foundryPage,
}) => {
  const result = await withForcedDice(
    foundryPage,
    [d100(73)],
    async () => foundryPage.evaluate(async () => {
      const { Roll } = window as unknown as {
        Roll: new (formula: string) => {
          evaluate(): Promise<{
            terms: Array<{ results?: Array<{ result: number }> }>;
          }>;
        };
      };
      const roll = await new Roll('1d100').evaluate();
      return roll.terms[0]?.results?.[0]?.result;
    }),
  );

  expect(result).toBe(73);
});

test('restores Foundry dice randomness after a forced roll', async ({
  foundryPage,
}) => {
  await foundryPage.evaluate(() => {
    const foundryWindow = window as unknown as {
      CONFIG: { Dice: { randomUniform: () => number } };
      impmalOriginalRandomUniformForTest?: () => number;
    };
    foundryWindow.impmalOriginalRandomUniformForTest = foundryWindow.CONFIG.Dice.randomUniform;
  });

  await withForcedDice(
    foundryPage,
    [d100(1)],
    async () => foundryPage.evaluate(async () => {
      const { Roll } = window as unknown as {
        Roll: new (formula: string) => { evaluate(): Promise<unknown> };
      };
      await new Roll('1d100').evaluate();
    }),
  );

  const randomnessWasRestored = await foundryPage.evaluate(() => {
    const foundryWindow = window as unknown as {
      CONFIG: { Dice: { randomUniform: () => number } };
      impmalOriginalRandomUniformForTest?: () => number;
    };
    const restored = foundryWindow.CONFIG.Dice.randomUniform
      === foundryWindow.impmalOriginalRandomUniformForTest;
    delete foundryWindow.impmalOriginalRandomUniformForTest;
    return restored;
  });

  expect(randomnessWasRestored).toBe(true);
});

test('restores Foundry dice randomness after a forced action fails', async ({
  foundryPage,
}) => {
  await foundryPage.evaluate(() => {
    const foundryWindow = window as unknown as {
      CONFIG: { Dice: { randomUniform: () => number } };
      impmalOriginalRandomUniformForTest?: () => number;
    };
    foundryWindow.impmalOriginalRandomUniformForTest = foundryWindow.CONFIG.Dice.randomUniform;
  });

  await expect(withForcedDice(
    foundryPage,
    [d100(1)],
    async () => foundryPage.evaluate(async () => {
      const { Roll } = window as unknown as {
        Roll: new (formula: string) => { evaluate(): Promise<unknown> };
      };
      await new Roll('1d100').evaluate();
      throw new Error('Expected test failure');
    }),
  )).rejects.toThrow('Expected test failure');

  const randomnessWasRestored = await foundryPage.evaluate(() => {
    const foundryWindow = window as unknown as {
      CONFIG: { Dice: { randomUniform: () => number } };
      impmalOriginalRandomUniformForTest?: () => number;
    };
    const restored = foundryWindow.CONFIG.Dice.randomUniform
      === foundryWindow.impmalOriginalRandomUniformForTest;
    delete foundryWindow.impmalOriginalRandomUniformForTest;
    return restored;
  });

  expect(randomnessWasRestored).toBe(true);
});
