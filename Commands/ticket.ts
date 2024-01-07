import { Client, CommandInteraction, MessageActionRow, Permissions, MessageButton, MessageEmbed } from 'discord.js';

export const data = {
  name: 'ticket',
  description: 'Create a support ticket',
};

export const execute = async (client: Client, interaction: CommandInteraction) => {
  const member = interaction.member;

  if (!member || !(member.permissions instanceof Permissions) || !member.permissions.has('ADMINISTRATOR')) {
    return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
  }

  if (!member) {
    return interaction.reply({
      content: 'Unable to identify the user.',
      ephemeral: true,
    });
  }

  const guild = interaction.guild; 

  const ticketButton = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId('create_ticket')
      .setLabel('📩')
      .setStyle('PRIMARY'),
  );

  const embedMessage = new MessageEmbed()
    .setTitle('Create a Ticket')
    .setDescription('To create a ticket for support, click on 📩.')
    .setColor('#2f3136')
    .setFooter({
      text: `E-girl invasion | Support`,
      iconURL: guild?.iconURL({ dynamic: true }) || undefined
    });
    
  if (!guild?.icon) {
    embedMessage.setThumbnail('https://cdn.discordapp.com/avatars/1159414254861037588/6899f4ffead6457390a02d0bde97d44e.png?size=1024');
  }

  await interaction.reply({
    content: "<:support:1188490178961092618> Need help? <:support:1188490178961092618>",
    embeds: [embedMessage],
    components: [ticketButton],
  });
};
