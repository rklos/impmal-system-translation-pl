import type { Locator, Page } from '@playwright/test';

export class ChatPage {
  public constructor(public readonly page: Page) {}

  public readonly message = (messageId: string): Locator => this.page
    .locator(`#chat .chat-log .chat-message[data-message-id="${messageId}"]`);

  public readonly opposedMessage = (messageId: string): Locator => this
    .message(messageId)
    .locator('.opposed');

  public readonly latestMessage = (): Locator => this.page
    .locator('#chat .chat-log .chat-message')
    .last();

  public readonly chatTab = (): Locator => this.page
    .locator('#ui-right [data-tab="chat"], #sidebar-tabs [data-tab="chat"]')
    .filter({ visible: true })
    .first();

  public async openChat(): Promise<void> {
    await this.chatTab().click();
  }

  public async createAppliedOpposedMessage(): Promise<string> {
    const messageId = await this.page.evaluate(async () => {
      const foundry = (window as unknown as {
        foundry: {
          applications: {
            handlebars: {
              renderTemplate(
                path: string,
                context: Record<string, unknown>,
              ): Promise<string>;
            };
          };
        };
      }).foundry;
      const chatMessage = (window as unknown as {
        ChatMessage: {
          create(data: {
            content: string;
            speaker: {
              alias: string;
            };
          }): Promise<{
            id: string;
          } | undefined>;
        };
      }).ChatMessage;
      const content = await foundry.applications.handlebars.renderTemplate(
        'systems/impmal/templates/chat/opposed.hbs',
        {
          applied: {
            modifiers: [],
            text: 'Base profile damage',
          },
          attacker: {
            id: 'base-profile-attacker',
            name: 'Atakujący',
            texture: {
              src: 'icons/svg/mystery-man.svg',
            },
          },
          attackerTest: {},
          defender: {
            id: 'base-profile-defender',
            name: 'Obrońca',
            texture: {
              src: 'icons/svg/mystery-man.svg',
            },
          },
          result: {
            damage: 4,
            SL: 1,
            tooltips: {
              damage: 'Base profile damage',
            },
            winner: 'attacker',
          },
        },
      );
      const message = await chatMessage.create({
        content,
        speaker: {
          alias: 'Polish opposed translation test',
        },
      });
      if (!message) {
        throw new Error('Foundry did not create the opposed chat test message');
      }
      return message.id;
    });

    await this.message(messageId).waitFor({ state: 'visible' });
    return messageId;
  }

  public async deleteMessage(messageId: string): Promise<void> {
    await this.page.evaluate(async (id) => {
      const game = (window as unknown as {
        game: {
          messages: Map<string, {
            delete(): Promise<unknown>;
          }>;
        };
      }).game;
      await game.messages.get(id)?.delete();
    }, messageId);
  }
}
