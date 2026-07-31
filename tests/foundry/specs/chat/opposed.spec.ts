import { expect, test } from '../../fixtures';
import { ChatPage } from '../../pages/chat-page';

test('shows translated opposed-test text in chat', async ({ foundryPage }) => {
  const chat = new ChatPage(foundryPage);
  const messageId = await chat.createAppliedOpposedMessage();
  const message = chat.opposedMessage(messageId);

  try {
    await expect(message).toContainText('Atakujący celuje w Obrońca');
    await expect(message).toContainText('(Zastosowane)');
  } finally {
    await chat.deleteMessage(messageId);
  }
});
