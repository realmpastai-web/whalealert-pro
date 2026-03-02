import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getDb } from '../database/db';
import { config } from '../config';
import logger from '../utils/logger';

export const data = new SlashCommandBuilder()
  .setName('watch')
  .setDescription('Start watching a token for whale alerts')
  .addStringOption(option =>
    option
      .setName('token')
      .setDescription('Token contract address (ETH mainnet)')
      .setRequired(true)
  )
  .addIntegerOption(option =>
    option
      .setName('threshold')
      .setDescription('Minimum USD value to alert (default: 100000)')
      .setMinValue(1000)
      .setMaxValue(10000000)
      .setRequired(false)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const tokenAddress = interaction.options.get('token')?.value as string;
  const threshold = (interaction.options.get('threshold')?.value as number) || config.bot.defaultThreshold;
  const guildId = interaction.guildId!;
  const channelId = interaction.channelId;

  // Validate address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
    await interaction.reply({
      content: '❌ Invalid Ethereum address format. Please provide a valid 0x address.',
      ephemeral: true,
    });
    return;
  }

  try {
    const db = getDb();

    // Check current watch count
    const countResult = await db.get(
      'SELECT COUNT(*) as count FROM watched_tokens WHERE guild_id = ?',
      [guildId]
    );
    
    const currentCount = countResult?.count || 0;
    const isPremium = false; // TODO: Check guild premium status

    if (!isPremium && currentCount >= config.bot.maxFreeWatches) {
      await interaction.reply({
        content: `⚠️ Free tier limit reached! You can only watch ${config.bot.maxFreeWatches} tokens.\nUpgrade to Premium for unlimited watches!`,
        ephemeral: true,
      });
      return;
    }

    // Insert watch
    await db.run(
      `INSERT OR REPLACE INTO watched_tokens (guild_id, channel_id, token_address, threshold_usd, is_premium)
       VALUES (?, ?, ?, ?, ?)`,
      [guildId, channelId, tokenAddress.toLowerCase(), threshold, isPremium ? 1 : 0]
    );

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('🔭 Now Watching Token')
      .setDescription(`Monitoring whale movements for token`)
      .addFields(
        { name: 'Token Address', value: `\`${tokenAddress}\``, inline: false },
        { name: 'Alert Threshold', value: `$${threshold.toLocaleString()}`, inline: true },
        { name: 'Watches Active', value: `${currentCount + 1}/${isPremium ? '∞' : config.bot.maxFreeWatches}`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'WhaleAlert Pro' });

    await interaction.reply({ embeds: [embed] });
    logger.info(`Guild ${guildId} started watching token ${tokenAddress}`);

  } catch (error) {
    logger.error('Error in watch command:', error);
    await interaction.reply({
      content: '❌ An error occurred. Please try again later.',
      ephemeral: true,
    });
  }
}