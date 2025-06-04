import { WebhookClient, EmbedBuilder } from 'discord.js';

let webhook;
if (process.env.DISCORD_WEBHOOK) {
  webhook = new WebhookClient({
    url: process.env.DISCORD_WEBHOOK,
  });
}

export async function sendNotification(job, output) {
  if (!process.env.DISCORD_WEBHOOK) return console.log('No Discord webhook URL found');

  const embed = new EmbedBuilder()
    .setColor('#006FFF')
    .setTitle(job)
    .setDescription('Job has reported!')
    .addFields(
      { name: 'Repository', value: process.env.GITHUB_REPOSITORY || 'Unknown' },
      { name: 'Workflow', value: process.env.GITHUB_WORKFLOW || 'Unknown' },
      { name: 'Run ID', value: process.env.GITHUB_RUN_ID || 'Unknown' },
      { name: '\u200B', value: '\u200B' },
      { name: 'Output', value: output || 'No output available' },
    )
    .setTimestamp();

  await webhook.send({ embeds: [ embed ] });
}

export async function reportError(job, error) {
  if (!process.env.DISCORD_WEBHOOK) return console.log('No Discord webhook URL found');

  const embed = new EmbedBuilder()
    .setColor('#FF0000')
    .setTitle(job)
    .setDescription('Job has reported an error!')
    .addFields(
      { name: 'Repository', value: process.env.GITHUB_REPOSITORY || 'Unknown' },
      { name: 'Workflow', value: process.env.GITHUB_WORKFLOW || 'Unknown' },
      { name: 'Run ID', value: process.env.GITHUB_RUN_ID || 'Unknown' },
      { name: '\u200B', value: '\u200B' },
      { name: 'Error', value: error || 'No error available' },
    )
    .setTimestamp();

  await webhook.send({ embeds: [ embed ] });
}
