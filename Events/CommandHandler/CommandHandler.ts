import { Client, CommandInteraction, Collection } from 'discord.js';
import { readdirSync } from 'fs';
import chalk from 'chalk';

interface BotClient extends Client {
  commands: Collection<string, any>; 
  globalCommands: any[];
}

export const execute = async (client: BotClient, interaction: CommandInteraction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(client, interaction);
  } catch (error) {
    console.error('\x1b[31m[-]\x1b[0m', error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
};
console.log(`\x1b[33m[*]\x1b[0m Command list:\n`)

export const loadCommands = (client: BotClient, dir: string) => {
  const commandFiles = readdirSync(dir).filter(file => file.endsWith('.ts'));

  for (const file of commandFiles) {
    const commandModule = require(`../../Commands/${file}`);
    const { data, execute } = commandModule;

    client.commands.set(data.name, { execute });
    client.globalCommands.push(data);
    const timestamp = new Date();
    const timeString = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const action = chalk.green('[+]') + `[\x1b[90m${timeString}\x1b[0m] Command loaded:`;
    const name = chalk.magenta('[%]') + data.name;
    console.log(`${action} ${name}`);
  }

  console.log('\n'); 
}