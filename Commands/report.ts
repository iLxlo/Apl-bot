import { Client, CommandInteraction, MessageActionRow, Permissions, MessageButton, MessageEmbed, TextChannel } from 'discord.js';


export const data = {
  name: 'report',
  description: 'Create a report for problems',
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

  const reportButton = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId('create_report') 
      .setLabel('Report')
      .setStyle('DANGER'),
  );

  const embedMessage = new MessageEmbed()
    .setAuthor({name: 'e-girl invasion | Report System', iconURL: guild?.iconURL({ dynamic: true }) || undefined})
    .setTitle('Report User')
    .setDescription("Found someone breaking rules or acting against the Discord's ToS or community guidelines? Feel free to report them using the button below.\n**Make sure you have your DMs enabled and you are able to receive DMs from <@1130083482878623835> as the bot will begin the reporting process in your DMs.** ")
    .setColor('#2f3136')
    .setFooter({text: `♡ Staff team is here to help! ♡`, iconURL: guild?.iconURL({ dynamic: true }) || undefined});

  if (!guild?.icon) {
    embedMessage.setThumbnail('https://example.com/default-icon.png');
  }

  await interaction.reply({
    content: "<a:kittyheart:1168230677985103964> Report User! <a:kittyheart:1168230677985103964>",
    embeds: [embedMessage],
    components: [reportButton],
  });
};
