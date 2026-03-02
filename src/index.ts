import { Client, GatewayIntentBits, Collection, REST, Routes, Events } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { config } from './config';
import { initDatabase } from './database/db';
import logger from './utils/logger';
import { startAlertMonitor } from './services/monitor';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

// Store commands
client.commands = new Collection();

async function loadCommands() {
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));
  
  const commandsData = [];

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(filePath);
    
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      commandsData.push(command.data.toJSON());
      logger.info(`Loaded command: ${command.data.name}`);
    } else {
      logger.warn(`Command ${file} missing required properties`);
    }
  }

  return commandsData;
}

async function registerCommands(commands: any[]) {
  const rest = new REST({ version: '10' }).setToken(config.discord.token);
  
  try {
    logger.info('Started refreshing application (/) commands.');
    
    await rest.put(
      Routes.applicationCommands(config.discord.clientId),
      { body: commands },
    );
    
    logger.info('Successfully reloaded application (/) commands.');
  } catch (error) {
    logger.error('Error registering commands:', error);
  }
}

// Event handlers
client.once(Events.ClientReady, async () => {
  logger.info(`Logged in as ${client.user?.tag}!`);
  
  // Start the alert monitoring service
  startAlertMonitor(client);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    logger.warn(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(`Error executing ${interaction.commandName}:`, error);
    
    const errorResponse = {
      content: '❌ There was an error executing this command!',
      ephemeral: true,
    };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorResponse);
    } else {
      await interaction.reply(errorResponse);
    }
  }
});

async function main() {
  try {
    // Initialize database
    await initDatabase();
    
    // Load and register commands
    const commands = await loadCommands();
    await registerCommands(commands);
    
    // Login to Discord
    await client.login(config.discord.token);
    
  } catch (error) {
    logger.error('Failed to start bot:', error);
    process.exit(1);
  }
}

main();

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  client.destroy();
  process.exit(0);
});