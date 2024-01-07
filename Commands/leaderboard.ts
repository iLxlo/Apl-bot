import { Client, CommandInteraction, TextChannel, Permissions, Message, MessageEmbed } from 'discord.js';
import { getMessageCount, updateMessageCount } from '../database/message/message';
import * as EmojisData from '../database/Emojis/emoji.json';

const messageCounts = new Map<string, number>();
let leaderboardInterval: NodeJS.Timeout | null = null;
let leaderboardMessage: Message | null = null;

export const data = {
  name: 'message',
  description: 'Manage message-related commands',
  options: [
    {
      name: 'leaderboard',
      description: 'Display a message leaderboard for the specified channel',
      type: 1,
      options: [
        {
          name: 'channel',
          description: 'The channel to display the leaderboard for',
          type: 7,
          required: true,
        },
      ],
    },
  ],
};

export const execute = async (client: Client, interaction: CommandInteraction) => {
  const mentionedChannel = interaction.options.getChannel('channel') as TextChannel;
  const member = interaction.member;

  if (!member || !(member.permissions instanceof Permissions) || !member.permissions.has('ADMINISTRATOR')) {
    return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
  }

  if (!mentionedChannel) {
    return interaction.reply({ content: 'Invalid channel provided.', ephemeral: true });
  }

  if (leaderboardInterval) {
    clearInterval(leaderboardInterval);
    leaderboardInterval = null;
  }

  // Initial leaderboard message with an embed
  const initialEmbed = new MessageEmbed()
    .setTitle('Message Leaderboard')
    .setDescription('No messages yet.')
    .setColor('#3498db');

  leaderboardMessage = await mentionedChannel.send({ embeds: [initialEmbed] });

  leaderboardInterval = setInterval(updateLeaderboard, 1000);
};

export const handleMessage = (client: Client, message: Message) => {
  if (message.author.bot) {
    return;
  }

  const userId = message.author.id;

  getMessageCount(userId, (count) => {
    const newCount = count + 1;

    updateMessageCount(userId, newCount);

    messageCounts.set(userId, newCount);

    updateLeaderboard();
  });
};

const updateLeaderboard = () => {
  if (!leaderboardMessage) {
    return;
  }

  const topUsers = Array.from(messageCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  const guildIcon = leaderboardMessage.guild?.iconURL({ dynamic: true }) || EmojisData.links.thumbnail;

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const formattedTimestamp = `<t:${currentTimestamp}:R>`;

  const embed = new MessageEmbed()
    .setTitle('Message Leaderboard')
    .setDescription(
      topUsers.length
        ? topUsers.map(([userId, count], index) => {
          const positionEmoji = EmojisData.emojis.leaderboard[(index + 1).toString() as keyof typeof EmojisData.emojis.leaderboard] || '';
          return `${positionEmoji} <@${userId}> - ${count} message(s)`;
          }).join('\n')
        : 'No messages yet.'
    )
    .addFields({name:'** **', value:'Last Update | '+ formattedTimestamp })
    .setThumbnail(guildIcon)
    .setImage('https://cdn.discordapp.com/attachments/799374477511098409/883430601338785812/rainbow_divider.gif');


    
  leaderboardMessage.edit({ embeds: [embed] });
};