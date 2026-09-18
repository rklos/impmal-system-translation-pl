import type { Page } from '@playwright/test';
import { d100, withForcedDice } from '../../helpers/dice-control';
import { expect, test } from '../../fixtures';
import { ChatPage } from '../../pages/chat-page';
import { CharacterSheetPage } from '../../pages/character-sheet-page';

async function rollAthleticsTest(
  foundryPage: Page,
  characterSheet: CharacterSheetPage,
  chat: ChatPage,
  applicationId: string,
  { difficulty, outcome, result }: {
    difficulty: string;
    outcome: string;
    result: number;
  },
): Promise<string> {
  await characterSheet.application(applicationId)
    .locator('[data-key="athletics"] [data-action="rollTest"][data-type="skill"]')
    .first()
    .click();

  const dialog = foundryPage.locator('form').filter({
    has: foundryPage.locator('input[name="modifier"]'),
  });
  await dialog.locator('select[name="difficulty"]').selectOption(difficulty);

  const messages = foundryPage.locator('#chat .chat-log .chat-message');
  const messageCount = await messages.count();
  await withForcedDice(foundryPage, [d100(result)], async () => {
    await dialog.locator('button[type="submit"]').click();
    await expect(messages).toHaveCount(messageCount + 1);
  });

  const message = chat.latestMessage();
  await expect(message).toContainText(outcome);
  const messageId = await message.getAttribute('data-message-id');
  if (!messageId) {
    throw new Error('Foundry did not create a skill test chat message');
  }
  return messageId;
}

test('shows Polish skill test settings and a successful test message', async ({ foundryPage }) => {
  const characterSheet = new CharacterSheetPage(foundryPage);
  const chat = new ChatPage(foundryPage);
  const character = await characterSheet.openDisposableCharacter();
  let messageId: string | undefined;

  try {
    await characterSheet.selectTab(character.applicationId, 'skills');
    await characterSheet.application(character.applicationId)
      .locator('[data-key="athletics"] [data-action="rollTest"][data-type="skill"]')
      .first()
      .click();

    const dialog = foundryPage.locator('form').filter({
      has: foundryPage.locator('input[name="modifier"]'),
    });
    await expect(dialog).toContainText('Modyfikator');
    await expect(dialog).toContainText('PS');
    await expect(dialog).toContainText('Trudność');

    const messageCount = await foundryPage.locator('#chat .chat-log .chat-message').count();
    await withForcedDice(foundryPage, [d100(15)], async () => {
      await dialog.locator('button[type="submit"]').click();
      await expect(foundryPage.locator('#chat .chat-log .chat-message')).toHaveCount(messageCount + 1);
    });

    const message = chat.latestMessage();
    await expect(message).toContainText('Sukces');
    messageId = await message.getAttribute('data-message-id') ?? undefined;
  } finally {
    if (messageId) await chat.deleteMessage(messageId);
    await characterSheet.closeAndDelete(character.actorId);
  }
});

for (const testCase of [
  { difficulty: 'challenging', outcome: 'Sukces', result: 15 },
  { difficulty: 'challenging', outcome: 'Porażka', result: 49 },
  { difficulty: 'veryEasy', outcome: 'Zadziwiający Sukces', result: 15 },
  { difficulty: 'challenging', outcome: 'Zadziwiająca Porażka', result: 99 },
]) {
  test(`shows ${testCase.outcome} for a skill test`, async ({ foundryPage }) => {
    const characterSheet = new CharacterSheetPage(foundryPage);
    const chat = new ChatPage(foundryPage);
    const character = await characterSheet.openDisposableCharacter();
    let messageId: string | undefined;

    try {
      await characterSheet.selectTab(character.applicationId, 'skills');
      messageId = await rollAthleticsTest(
        foundryPage,
        characterSheet,
        chat,
        character.applicationId,
        testCase,
      );
    } finally {
      if (messageId) await chat.deleteMessage(messageId);
      await characterSheet.closeAndDelete(character.actorId);
    }
  });
}

test('shows translated context menu for a skill test chat message', async ({ foundryPage }) => {
  const characterSheet = new CharacterSheetPage(foundryPage);
  const chat = new ChatPage(foundryPage);
  const character = await characterSheet.openDisposableCharacter();
  let messageId: string | undefined;

  try {
    await characterSheet.selectTab(character.applicationId, 'skills');
    messageId = await rollAthleticsTest(
      foundryPage,
      characterSheet,
      chat,
      character.applicationId,
      { difficulty: 'challenging', outcome: 'Sukces', result: 15 },
    );

    await chat.openChat();
    await chat.message(messageId).click({ button: 'right' });
    const contextMenuItems = foundryPage.locator('#context-menu li.context-item');
    await expect(contextMenuItems.first()).toBeVisible();
    expect(await contextMenuItems.allTextContents()).toEqual(expect.arrayContaining([
      'Edytuj Test',
      'Przerzut Testu',
      'Przerzut Testu (-1 Punkt Przeznaczenia)',
      'Dodaj PS (-1 Punkt Przeznaczenia)',
    ]));
  } finally {
    if (messageId) await chat.deleteMessage(messageId);
    await characterSheet.closeAndDelete(character.actorId);
  }
});
