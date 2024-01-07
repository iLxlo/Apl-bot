import { Client, ButtonInteraction, Interaction, TextChannel } from 'discord.js';
import { saveTicketChannel, getTicketChannel, deleteTicketChannel } from '../../database/channels/Ticket/ticketApply'; 
import { ChannelIDs }from '../../config/config' 

enum ChannelTypes {
  GUILD_TEXT = 'GUILD_TEXT',
}

export const handleButtonClick = async (client: Client, interaction: Interaction) => {
  if (!interaction.isButton()) return;

  const { customId, user } = interaction;

  await interaction.reply({
    content: "Creating your ticket...",
    ephemeral: true,
  });

  if (customId === 'create_ticket') {
    try {
      await createTicket(client, user.id, interaction as unknown as ButtonInteraction);
    } catch (error) {
      console.error(error);
      await interaction.followUp({
        content: 'An error occurred while processing your request. Please try again later.',
        ephemeral: true,
      });
    }
  }
};

const createTicket = async (client: Client, userId: string, interaction: ButtonInteraction) => {
  const guild = client.guilds.cache.get('1124662025503641700');
  const member = guild?.members.cache.get(userId);

  if (!guild || !member) {
    return await interaction.followUp({
      content: 'Unable to create a ticket. Please try again later.',
      ephemeral: true,
    });
  }

  try {
    let ticketChannelId = await getTicketChannel(userId);

    if (!ticketChannelId) {
      const ticketChannel = await guild.channels.create(`ticket-${userId}`, {
        type: ChannelTypes.GUILD_TEXT,
        parent: ChannelIDs.parent,
        permissionOverwrites: [
          {
            id: guild.id,
            deny: ['VIEW_CHANNEL'],
          },
          {
            id: userId,
            allow: ['VIEW_CHANNEL'],
          },
        ],
      }) as TextChannel;

      ticketChannelId = ticketChannel.id;
      saveTicketChannel(userId, ticketChannelId);

      await ticketChannel.send(`<@${userId}> welcome, this is your ticket room. Please explain your issue.`);

      await interaction.followUp({
        content: `Your ticket channel has been created: <#${ticketChannelId}>`,
        ephemeral: true,
      });
    } else {
      const existingTicketChannel = guild.channels.cache.get(ticketChannelId) as TextChannel | undefined;

      if (existingTicketChannel) {
        await interaction.followUp({
          content: `Your ticket channel already exists: <#${existingTicketChannel.id}>`,
          ephemeral: true,
        });
      } else {
        const newTicketChannel = await guild.channels.create(`ticket-${userId}`, {
          type: ChannelTypes.GUILD_TEXT,
          parent: '1131568209678581760',
          permissionOverwrites: [
            {
              id: guild.id,
              deny: ['VIEW_CHANNEL'],
            },
            {
              id: userId,
              allow: ['VIEW_CHANNEL'],
            },
          ],
        }) as TextChannel;

        ticketChannelId = newTicketChannel.id;
        saveTicketChannel(userId, ticketChannelId);

        await newTicketChannel.send(`<@${userId}> welcome, this is your ticket room. Please explain your issue.`);

        await interaction.followUp({
          content: `Your ticket channel has been created: <#${ticketChannelId}>`,
          ephemeral: true,
        });
      }
    }
  } catch (error) {
    console.error(error);
    return await interaction.followUp({
      content: 'An error occurred while creating the ticket. Please try again later.',
      ephemeral: true,
    });
  }
};