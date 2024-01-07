import { Client, GuildMember, TextChannel } from 'discord.js';
import db from '../../database/dmWelcome/dmWelcomer';

interface WelcomeSettingsRow {
  welcomeMessage: string;
  welcomeToggle: number;
}


export const sendWelcomeMessage = async (member: GuildMember) => {
  const guildId = member.guild.id;

  db.get<WelcomeSettingsRow>('SELECT welcomeMessage, welcomeToggle FROM welcomeSettings WHERE guildId = ?', [guildId], async (err, row) => {
    if (err) {
      console.error('Error fetching welcome settings:', err);
      return;
    }

    const welcomeMessage = row ? row.welcomeMessage : getDefaultWelcomeMessage(member);
    const welcomeToggle = row ? row.welcomeToggle : 1; 

    if (welcomeToggle === 1) {
      const processedMessage = welcomeMessage.replace(/{user}/g, member.toString());

      try {
        await member.send(processedMessage);
      } catch (error) {
        console.error('Error sending welcome message to member:', error);
      }
    }
  });
};



const getDefaultWelcomeMessage = (member: GuildMember): string => {
  return `Welcome to the server, ${member.displayName}! We're glad to have you here.`;
};
