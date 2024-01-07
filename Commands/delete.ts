import { Client, CommandInteraction, TextChannel, Permissions } from 'discord.js';

export const data = {
  name: 'delete',
  description: 'Delete a channel',
  options: [
    {
      name: 'channel_id',
      description: 'The ID of the channel to delete',
      type: 3,
      required: true,
    },
  ],
};

export const execute = async (client: Client, interaction: CommandInteraction) => {
  if (!interaction.isCommand()) return;
  const member = interaction.member;

  if (!member || !(member.permissions instanceof Permissions) || !member.permissions.has('ADMINISTRATOR')) {
    return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
  }
  try {
    const channelId = interaction.options.getString('channel_id');

    if (!channelId) {
      await interaction.reply('No channel ID provided.');
      return;
    }

    const guild = interaction.guild;

    if (!guild) {
      await interaction.reply('Guild not found.');
      return;
    }

    const channelToDelete = guild.channels.cache.get(channelId) as TextChannel | undefined;

    if (channelToDelete) {
      const channelNameIncludesTicketOrReport = channelToDelete.name.toLowerCase().includes('ticket') ||
        channelToDelete.name.toLowerCase().includes('report');

      if (channelNameIncludesTicketOrReport) {
        await channelToDelete.delete();
        await interaction.reply(`Channel <#${channelId}> has been deleted.`);
      } else {
        await interaction.reply(`You can't delete channels that do not include "ticket" or "report" in their names.`);
      }
    } else {
      await interaction.reply('Channel not found.');
    }
  } catch (error) {
    console.error(error);
    await interaction.reply('An error occurred while processing your request. Please try again later.');
  }
};
