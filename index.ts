import { Client, Collection, Intents, CommandInteraction, Message, ButtonInteraction, SelectMenuInteraction } from 'discord.js'; // Add SelectMenuInteraction
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { execute as commandHandler, loadCommands } from './Events/CommandHandler/CommandHandler';
import { handleGuildMemberAdd } from './Events/welcomer/welcome';
import { handlegGuildMemberAdd } from './Events/Greeter/greeter';
import { handleMessage as lbHandleMessage, execute as lbExecute } from './Commands/leaderboard';
import { handleButtonClick } from './Events/Buttons/handler';
import { handleButtonInteraction } from './Events/Buttons/reportHandler';
import { sendWelcomeMessage } from './Events/dmWelcome/dmWelcome'; 

import config from './config/config';

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS, 
    Intents.FLAGS.GUILD_MEMBERS, 
    Intents.FLAGS.GUILD_MESSAGES, 
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
}) as Client & { commands: Collection<string, any>, globalCommands: any[] };
export { client };

const voiceChannels = client.channels.cache.filter(
  (channel) => channel.type === 'GUILD_VOICE' && channel.members.size > 0
);

client.globalCommands = [];
client.commands = new Collection();

loadCommands(client, './Commands');

client.on('guildMemberAdd', (member) => {
  handleGuildMemberAdd(client, member);
  handlegGuildMemberAdd(client, member);
  sendWelcomeMessage(member);
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isSelectMenu()) {
  } else if (interaction.isCommand()) {
    await commandHandler(client, interaction as CommandInteraction);
  } else if (interaction.isButton()) {
    const customId = interaction.customId;

    if (customId === 'create_ticket') {
      handleButtonClick(client, interaction as ButtonInteraction);
    } else if (customId === 'create_report' || customId === 'delete_ticket') {
      handleButtonInteraction(client, interaction as ButtonInteraction);
    }
  }
});

client.on('messageCreate', (message) => lbHandleMessage(client, message));

const rest = new REST({ version: '9' }).setToken(config.token);

(async () => {
  try {
    console.log('\x1b[33m[*]\x1b[0m \x1b[32mStarted\x1b[0m refreshing application \x1b[35m(/)\x1b[0m commands.');

    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: client.globalCommands },
    );
    const timestamp = new Date();
    const timeString = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    console.log(`[\x1b[90m${timeString}\x1b[0m]\x1b[33m[+]\x1b[0m \x1b[32mSuccessfully\x1b[0m reloaded application \x1b[35m(/)\x1b[0m commands.`); 
  } catch (error) {
    console.error('\x1b[31m[-]\x1b[0m', error); 
  }
})();

client.login(config.token);
