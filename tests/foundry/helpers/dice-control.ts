import type { Page } from '@playwright/test';

export type ForcedDie = {
  faces: number;
  result: number;
};

type DiceControlState = {
  originalRandomUniform: () => number;
  queuedUniforms: number[];
};

type FoundryDiceWindow = {
  CONFIG: {
    Dice: {
      randomUniform: () => number;
    };
  };
  impmalDiceControl?: DiceControlState;
};

export function d100(result: number): ForcedDie {
  return { faces: 100, result };
}

function randomUniformForFace({ faces, result }: ForcedDie): number {
  if (!Number.isInteger(faces) || faces < 2) {
    throw new Error(`Forced die must have at least two faces, received ${faces}.`);
  }
  if (!Number.isInteger(result) || result < 1 || result > faces) {
    throw new Error(`Forced d${faces} result must be between 1 and ${faces}, received ${result}.`);
  }
  return 1 - ((result - 0.5) / faces);
}

export async function withForcedDice<T>(
  page: Page,
  dice: readonly ForcedDie[],
  action: () => Promise<T>,
): Promise<T> {
  const uniforms = dice.map(randomUniformForFace);
  await page.evaluate((queuedUniforms) => {
    const foundryWindow = window as unknown as FoundryDiceWindow;
    if (foundryWindow.impmalDiceControl) {
      throw new Error('Forced dice control is already installed for this page.');
    }
    foundryWindow.impmalDiceControl = {
      originalRandomUniform: foundryWindow.CONFIG.Dice.randomUniform,
      queuedUniforms,
    };
    foundryWindow.CONFIG.Dice.randomUniform = () => {
      const state = foundryWindow.impmalDiceControl;
      const next = state?.queuedUniforms.shift();
      if (next === undefined) {
        throw new Error('Foundry roll requested an unexpected die result.');
      }
      return next;
    };
  }, [ ...uniforms ]);

  try {
    const result = await action();
    const remaining = await page.evaluate(() => (
      (window as unknown as FoundryDiceWindow).impmalDiceControl?.queuedUniforms.length ?? 0
    ));
    if (remaining !== 0) {
      throw new Error(`Foundry roll did not consume ${remaining} forced die result(s).`);
    }
    return result;
  } finally {
    await page.evaluate(() => {
      const foundryWindow = window as unknown as FoundryDiceWindow;
      const state = foundryWindow.impmalDiceControl;
      if (state) {
        foundryWindow.CONFIG.Dice.randomUniform = state.originalRandomUniform;
        delete foundryWindow.impmalDiceControl;
      }
    });
  }
}
