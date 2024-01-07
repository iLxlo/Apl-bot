import { Client, ButtonInteraction, Interaction, TextChannel, MessageEmbed, MessageButton, MessageActionRow } from 'discord.js';
import { saveReportChannel, getReportChannel } from '../../database/channels/report/reportChannels';
import { RoleIDs } from '../../config/config'; 

enum ChannelTypes {
  GUILD_TEXT = 'GUILD_TEXT',
}
const handleDeleteTicket = async (client: Client, interaction: ButtonInteraction) => {
  const isAdmin = interaction.guild?.members.cache.get(interaction.user.id)?.permissions.has('ADMINISTRATOR');

  if (isAdmin) {
    try {
      const channelId = interaction.channelId;
      const deletedChannel = await interaction.guild?.channels.fetch(channelId);
      if (deletedChannel instanceof TextChannel) {
        await deletedChannel.send('The ticket is being deleted...');
        await deletedChannel.delete();
      } else {
        await interaction.followUp('Unable to delete the ticket. Please try again later.');
      }
    } catch (error) {
      console.error(error);
      await interaction.followUp('An error occurred while deleting the ticket. Please try again later.');
    }
  } else {
    await interaction.followUp('You do not have permission to delete tickets.');
  }
};


export const handleButtonInteraction = async (client: Client, interaction: ButtonInteraction) => {
  const customId = interaction.customId;

  if (customId === 'create_report') {
    handleReportButtonClick(client, interaction);
  } else if (customId === 'delete_ticket') {
    handleDeleteTicket(client, interaction);
  }
};

export const handleReportButtonClick = async (client: Client, interaction: Interaction) => {
  if (!interaction.isButton()) return;

  const { customId, user } = interaction;

  const initialReply = await interaction.reply({
    content: "Processing your report request...",
    ephemeral: true,
  });

  if (customId === 'create_report') {
    try {
      await createReportChannel(client, user.id, interaction as ButtonInteraction, initialReply);
    } catch (error) {
      console.error(error);
      const followUpMessage = await interaction.followUp({
        content: 'An error occurred while creating the report channel. Please try again later.',
        ephemeral: true,
      });
      return followUpMessage;
    }
  } else if (customId === 'delete_ticket') {
    const isAdmin = interaction.guild?.members.cache.get(user.id)?.permissions.has('ADMINISTRATOR');

    if (isAdmin) {
      try {
        const channelId = interaction.channelId;
        const deletedChannel = await interaction.guild?.channels.fetch(channelId);
        if (deletedChannel instanceof TextChannel) {
          await deletedChannel.delete();
          await interaction.followUp('The ticket has been deleted.');
        } else {
          await interaction.followUp('Unable to delete the ticket. Please try again later.');
        }
      } catch (error) {
        console.error(error);
        await interaction.followUp('An error occurred while deleting the ticket. Please try again later.');
      }
    } else {
      await interaction.followUp('You do not have permission to delete tickets.');
    }
  }
};

const createReportChannel = async (client: Client, userId: string, interaction: ButtonInteraction, initialReply: any) => {
  const guildId = '1124662025503641700';
  const guild = client.guilds.cache.get(guildId);

  if (!guild) {
    return await interaction.followUp({
      content: 'Unable to create a report channel. Please try again later.',
      ephemeral: true,
    });
  }

  const existingReportChannelId = await getReportChannel(userId);

  if (existingReportChannelId) {
    const existingReportChannel = guild.channels.cache.get(existingReportChannelId) as TextChannel | undefined;

    if (existingReportChannel) {
      return await interaction.followUp({
        content: `Your report channel already exists: <#${existingReportChannel.id}>`,
        ephemeral: true,
      });
    } else {
      getReportChannel(userId);
    }
  }

  try {
    const dmChannel = await guild.members.fetch(userId).then((member) => member.createDM());

    const userIdEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Making a report...')
      .setDescription('Please provide the user ID or name of the user you are reporting.')
      .setFooter({ text: 'Ex. ahmett or 967125717533982730' });

    await dmChannel.send({ embeds: [userIdEmbed] });

    const userIdCollector = dmChannel.createMessageCollector({
      filter: (msg) => msg.author.id === userId,
      max: 1,
      time: 60000,
    });

    userIdCollector.on('end', async (collected, reason) => {
      if (reason === 'time') {
        console.log('User ID collection timed out.');
        await dmChannel.send('Report creation timed out. Please try again.');
      } else {
        const providedUserId = collected.first()?.content.trim();
        if (!providedUserId || !isValidUserId(providedUserId)) {
          console.log('Invalid user ID provided.');
          await dmChannel.send('Invalid user ID provided. Please try again with a valid user ID.');
        } else {
          console.log('User ID collected:', providedUserId);


          const reasonEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Making a report...')
            .setDescription('Please Type a reason:')
            .setFooter({text: 'Ex. Bot abuse, Staff report (abuse), Threats'});

          await dmChannel.send({ embeds: [reasonEmbed] });

          const reasonCollector = dmChannel.createMessageCollector({
            filter: (msg) => !msg.author.bot && msg.author.id === userId,
            max: 1,
            time: 60000,
          });

          reasonCollector.on('collect', async (msg) => {
            const providedReason = msg.content.trim();

            try {
              const reportChannel = (await guild.channels.create(`report-${userId}`, {
                type: ChannelTypes.GUILD_TEXT,
                parent: '1188935349884432454',
                permissionOverwrites: [
                  {
                    id: guild.id,
                    deny: ['VIEW_CHANNEL'],
                  },
                  {
                    id: userId,
                    allow: ['VIEW_CHANNEL'],
                  },
                  {
                    id: RoleIDs.admin, 
                    allow: ['VIEW_CHANNEL', 'MANAGE_CHANNELS'],
                  },
                  {
                    id: RoleIDs.moderator, 
                    allow: ['VIEW_CHANNEL', 'MANAGE_CHANNELS'],
                  },
                ],
              })) as TextChannel;

              saveReportChannel(userId, reportChannel.id);

              await dmChannel.send(`Your report channel has been created: <#${reportChannel.id}>`);

              await interaction.followUp({
                content: `Your report channel has been created: <#${reportChannel.id}>`,
                ephemeral: true,
              });
              const reportContentEmbed = new MessageEmbed()
              .setColor('#0099ff')
              .setTitle('Report Ticket')
              .addFields(
                { name: 'Ticket creator', value: `<@${userId}>`, inline: true },
                { name: 'Reported user', value: `<@${providedUserId}>`, inline: true },
                { name: 'Reason', value: providedReason }
              );
              
              
            
            const deleteButton = new MessageButton()
              .setCustomId('delete_ticket')
              .setLabel('Delete Ticket')
              .setStyle('DANGER'); 
            
            const row = new MessageActionRow().addComponents(deleteButton);
            
            await reportChannel.send({ embeds: [reportContentEmbed], components: [row], content:`<@&${RoleIDs.moderator}>` });
            } catch (error) {
              console.error(error);
              await interaction.followUp({
                content: 'An error occurred while creating the report channel. Please try again later.',
                ephemeral: true,
              });
            }
          });

          reasonCollector.on('end', (_collected, reason) => {
            if (reason === 'time') {
              console.log('Reason collection timed out.');
              dmChannel.send('Report creation timed out. Please try again.');
            }
          });
        }
      }
    });

    userIdCollector.on('end', (_collected, reason) => {
      if (reason === 'time') {
        dmChannel.send('Report creation timed out. Please try again.');
      }
    });
  } catch (error) {
    console.error(error);
    await interaction.followUp({
      content: 'An error occurred while communicating with you. Please make sure your DMs are open.',
      ephemeral: true,
    });
  }
};

const isValidUserId = (userId: string): boolean => {
  const snowflakeRegex = /^[0-9]{17,19}$/;
  return snowflakeRegex.test(userId);
};