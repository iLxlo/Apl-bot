import { Client, CommandInteraction, Permissions } from 'discord.js';
import db from '../database/dmWelcome/dmWelcomer';

export const data = {
  name: 'dm',
  description: 'Set welcome message and toggle it on/off',
  options: [
    {
      name: 'welcomer', 
      description: 'Configure welcomer settings',
      type: 1, 
      options: [
        {
          name: 'message',
          type: 3,
          description: 'Set the welcomer message (optional)',
          required: false,
        },
        {
          name: 'toggle',
          type: 5,
          description: 'Toggle welcomer on/off',
          required: false,
        },
      ],
    },
  ],
};

export const execute = async (client: Client, interaction: CommandInteraction) => {
  const member = interaction.member;

  if (!member || !(member.permissions instanceof Permissions) || !member.permissions.has('ADMINISTRATOR')) {
    return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
  }

  const guildId = interaction.guild?.id;

  if (!guildId) {
    return interaction.reply({
      content: 'Unable to identify the server.',
      ephemeral: true,
    });
  }

  const toggle = interaction.options.getBoolean('toggle', true);
  const message = interaction.options.getString('message') || '';

  db.run(
    'INSERT OR REPLACE INTO welcomeSettings (guildId, welcomeMessage, welcomeToggle) VALUES (?, ?, ?)',
    [guildId, message, toggle ? 1 : 0],
    (err) => {
      if (err) {
        console.error('Error updating welcome settings:', err);
        return interaction.reply({ content: 'An error occurred while updating welcome settings.', ephemeral: true });
      }

      return interaction.reply({
        content: `Welcome message has been ${toggle ? 'enabled' : 'disabled'}.`,
        ephemeral: true,
      });
    }
  );
};
