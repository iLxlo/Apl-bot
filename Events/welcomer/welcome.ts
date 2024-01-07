import { Client, GuildMember, TextChannel, MessageEmbed, MessageButton, MessageActionRow } from 'discord.js';
import db from '../../database/welcome/db';  // Import the db module
import emojis = require('../../database/Emojis/emoji.json');

export const handleGuildMemberAdd = async (client: Client, member: GuildMember) => {
  try {
    /*console.log(`User ${member.user.tag} has joined the server.`);*/

    db.get<Record<string, any>>('SELECT welcomeChannelId FROM yourTable WHERE guildId = ?', [member.guild.id], (err, row) => {
      if (err) {
        console.error('Error fetching welcome channel from the database:', err);
        return;
      }

      const welcomeChannelId = row ? row.welcomeChannelId : null;

      const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId) as TextChannel;

      if (!welcomeChannel) {
        console.error('Welcome channel not found.');
        return;
      }

      const welcomeEmbed = new MessageEmbed()
      .setDescription(
        `${emojis.emojis.heart} Come chat with us in <#1176018218981261464> ${emojis.emojis.heart}\n\n` +
        `${emojis.emojis.star} [Click here to join VC and make new Friends](https://discord.com/channels/1124662025503641700/1147999377982500985)\n\n`
      )
      .setAuthor({
        name: member.user.username,
        iconURL: member.user.displayAvatarURL({ dynamic: true })
      })
      .setImage(emojis.links.image)
      .setThumbnail(emojis.links.thumbnail)
      .setFooter({text: "e-girl invasion wishes you a pleasant stay!", iconURL: emojis.links.footerIcon})
      .setTimestamp();
      const row2 = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setLabel('Join VC')
            .setStyle('LINK')
            .setEmoji(emojis.emojis.hellolove)
            .setURL('https://discord.com/channels/1124662025503641700/1147999377982500985'),
          
          new MessageButton()
            .setLabel('Create VC')
            .setStyle('LINK')
            .setEmoji(emojis.emojis.hellocreate)
            .setURL('https://discord.com/channels/1124662025503641700/1129900502587543632'),
      
          new MessageButton()
            .setLabel('Grab Colors')
            .setStyle('LINK')
            .setEmoji(emojis.emojis.helloGrab)
            .setURL('https://discord.com/channels/1124662025503641700/1128708478534434816'),
        );

      welcomeChannel.send({ embeds: [welcomeEmbed], components: [row2], content: `${emojis.emojis.heart} Welcome ${member.toString()} ${emojis.emojis.heart}` })
        /*.then(() => console.log('Welcome message sent successfully.')) */
        .catch(error => console.error('Error sending welcome message:', error));
    });
  } catch (error) {
    console.error('Error in welcome event:', error);
  }
};
