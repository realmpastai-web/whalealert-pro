import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';
import { getDb } from '../database/db';
import { config } from '../config';

export const data = new SlashCommandBuilder()
  .setName('watches')
  .setDescription('List all tokens being watched in this server');

export async function execute(interaction: CommandInteraction): Promise<void> {
  const guildId = interaction.guildId!;

  try {
    const db = getDb();
    const watches = await db.all(
      'SELECT token_address, threshold_usd, chain, created_at FROM watched_tokens WHERE guild_id = ?',
      [guildId]
    );

    if (watches.length === 0) {
      await interaction.reply({
        content: '🔍 No tokens are being watched. Use `/watch [token-address]` to start monitoring.',
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('📊 Active Watches')
      .setDescription(`Monitoring ${watches.length} token(s)`)
      .addFields(
        watches.map((w, i) => ({
          name: `#${i + 1} ${w.token_address.slice(0, 8)}...${w.token_address.slice(-4)}`,
          value: `Chain: \`${w.chain.toUpperCase()}\` | Threshold: \`$${w.threshold_usd.toLocaleString()}\``,
          inline: false,
        }))
      )
      .setTimestamp()
      .setFooter({ 
        text: `WhaleAlert Pro | Free tier: ${watches.length}/${config.bot.maxFreeWatches}` 
      });

    await interaction.reply({ embeds: [embed], ephemeral: true });

  } catch (error) {
    await interaction.reply({
      content: '❌ An error occurred. Please try again later.',
      ephemeral: true,
    });
  }
}