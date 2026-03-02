import { SlashCommandBuilder, CommandInteraction, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getDb } from '../database/db';
import logger from '../utils/logger';

export const data = new SlashCommandBuilder()
  .setName('unwatch')
  .setDescription('Stop watching a token')
  .addStringOption(option =>
    option
      .setName('token')
      .setDescription('Token contract address to stop watching')
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction: CommandInteraction): Promise<void> {
  const tokenAddress = interaction.options.get('token')?.value as string;
  const guildId = interaction.guildId!;

  try {
    const db = getDb();
    
    const result = await db.run(
      'DELETE FROM watched_tokens WHERE guild_id = ? AND token_address = ?',
      [guildId, tokenAddress.toLowerCase()]
    );

    if (result.changes === 0) {
      await interaction.reply({
        content: '❌ That token was not being watched.',
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0xff6600)
      .setTitle('🛑 Stopped Watching')
      .setDescription(`No longer monitoring: \`${tokenAddress}\``)
      .setTimestamp()
      .setFooter({ text: 'WhaleAlert Pro' });

    await interaction.reply({ embeds: [embed] });
    logger.info(`Guild ${guildId} stopped watching token ${tokenAddress}`);

  } catch (error) {
    logger.error('Error in unwatch command:', error);
    await interaction.reply({
      content: '❌ An error occurred. Please try again later.',
      ephemeral: true,
    });
  }
}