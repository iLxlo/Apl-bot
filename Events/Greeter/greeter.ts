import { Client, GuildMember, TextChannel, MessageEmbed } from 'discord.js';
import db from '../../database/greeter/greeter';

export const handlegGuildMemberAdd = async (client: Client, member: GuildMember) => {
  try {
    /*console.log(`User ${member.user.tag} has joined the server.`);*/

    db.get<Record<string, any>>(
      'SELECT channelId, deletionTime FROM settings WHERE guildId = ?',
      [member.guild.id],
      (err, row) => {
        if (err) {
          console.error('Error fetching welcome channel and deletion time from the database:', err);
          return;
        }

        const channelId = row ? row.channelId : null;
        const deletionTime = row ? row.deletionTime : 2;

        const welcomeChannel = member.guild.channels.cache.get(channelId) as TextChannel;

       if (!welcomeChannel) {
          console.error('Greeter channel not found.');
          return;
        }

        const emoji = {
          first: '<a:a_hklove:1186636299914977332>',
          second: '<a:a_hklove:1186636299914977332>',
          third: '<a:a_hklove:1186636299914977332>',
          fourth: '<a:a_hklove:1186636299914977332>',
        };

        const welcomeEmbed = new MessageEmbed()
          .setDescription(`${emoji.first} Come chat with us in <#1176018218981261464> ${emoji.second}\n\n${emoji.third} [Click here to join VC and make new Friends](https://discord.com/channels/1124662025503641700/1147999377982500985) ${emoji.fourth}`);

        welcomeChannel.send({ embeds: [welcomeEmbed] })
          .then(welcomeMessage => {
           /* console.log('Greeter sent successfully.'); */

            setTimeout(() => {
              welcomeMessage.delete().catch(console.error);
            }, deletionTime * 1000);
          })
          .catch(error => console.error('Error sending welcome message:', error));
      }
    );
  } catch (error) {
    console.error('Error in welcome event:', error);
  }
};
