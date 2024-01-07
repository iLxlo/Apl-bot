import { Client, CommandInteraction, TextChannel, Permissions } from 'discord.js';
import db from '../database/welcome/db';


export const data = {
  name: 'welcomer',
  description: 'Set the welcome channel',
  options: [
    {
      name: 'channel',
      description: 'The channel to set as the welcome channel',
      type: 7,
      required: true,
    },
  ],
};
export const execute = async (client: Client, interaction: CommandInteraction) => {
  const member = interaction.member;

  if (!member || !(member.permissions instanceof Permissions) || !member.permissions.has('ADMINISTRATOR')) {
    return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
  }

  const mentionedChannel = interaction.options.getChannel('channel') as TextChannel;

  if (!mentionedChannel) {
    return interaction.reply({ content: 'Please mention a channel or provide a valid channel ID.', ephemeral: true });
  }

  if (!interaction.guild) {
    return interaction.reply({ content: 'Guild information is not available.', ephemeral: true });
  }

  db.run('INSERT OR REPLACE INTO yourTable (guildId, welcomeChannelId) VALUES (?, ?)', [interaction.guild.id, mentionedChannel.id], (err) => {
    if (err) {
      console.error('Error updating database with the welcome channel:', err);
      return interaction.reply({ content: 'An error occurred while setting the welcome channel.', ephemeral: true });
    }

    interaction.reply(`Welcome channel set to ${mentionedChannel}`);
  });
};
