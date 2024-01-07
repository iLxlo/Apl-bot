import { Client, CommandInteraction, Permissions, TextChannel } from 'discord.js';
import db from '../database/greeter/greeter';

export const execute = async (client: Client, interaction: CommandInteraction) => {
  const member = interaction.member;

  if (!member || !(member.permissions instanceof Permissions) || !member.permissions.has('ADMINISTRATOR')) {
    return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
  }

  const mentionedChannel = interaction.options.getChannel('channel') as TextChannel;
  const deletionTime = interaction.options.getInteger('time');

  if (!mentionedChannel || !deletionTime || deletionTime < 1) {
    return interaction.reply({ content: 'Invalid channel or time provided.', ephemeral: true });
  }

  db.run(
    'INSERT OR REPLACE INTO settings (guildId, channelId, deletionTime) VALUES (?, ?, ?)',
    [interaction.guildId, mentionedChannel.id, deletionTime],
    (err) => {
      if (err) {
        console.error('Error updating database with the deletion time:', err);
        return interaction.reply({ content: 'An error occurred while setting the deletion time.', ephemeral: true });
      }

      interaction.reply(`Deletion time set to ${deletionTime} seconds for messages in ${mentionedChannel}.`);
    }
  );
};

export const data = {
  name: 'greeter',
  description: 'Set the deletion time for messages when someone joins the server.',
  options: [
    {
      name: 'channel',
      description: 'The channel to set as the welcome channel',
      type: 7,
      required: true,
    },
    {
      name: 'time',
      description: 'The deletion time in seconds',
      type: 4, 
      required: true,
    },
  ],
};