import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { getDb } from '../database/db';
import { formatAddress, getEtherscanTxUrl } from '../services/etherscan';

export const data = new SlashCommandBuilder()
  .setName('recent')
  .setDescription('Show recent whale alerts for this server')
  .addIntegerOption(option =>
    option
      .setName('limit')
      .setDescription('Number of alerts to show (default: 5)')
      .setMinValue(1)
      .setMaxValue(20)
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const guildId = interaction.guildId!;
  const limit = (interaction.options.get('limit')?.value as number) || 5;

  try {
    const db = getDb();
    const alerts = await db.all(
      `SELECT tx_hash, token_address, from_address, to_address, 
              amount_tokens, amount_usd, chain, alert_time
       FROM alert_history 
       WHERE guild_id = ? 
       ORDER BY alert_time DESC 
       LIMIT ?`,
      [guildId, limit]
    );

    if (alerts.length === 0) {
      await interaction.reply({
        content: '📭 No alerts yet. They will appear here when whale transactions are detected.',
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle('🐋 Recent Whale Alerts')
      .setDescription(`Last ${alerts.length} alert(s)`)
      .addFields(
        alerts.map((a, i) => ({
          name: `#${i + 1} $${a.amount_usd?.toLocaleString() || 'Unknown'}`,
          value: [
            `**From:** ${formatAddress(a.from_address)}`,
            `**To:** ${formatAddress(a.to_address)}`,
            `**Amount:** ${parseFloat(a.amount_tokens).toFixed(4)} tokens`,
            `**[View on Explorer](${getEtherscanTxUrl(a.tx_hash)})**`,
            `*${new Date(a.alert_time).toLocaleString()}*`
          ].join('\n'),
          inline: false,
        }))
      )
      .setTimestamp()
      .setFooter({ text: 'WhaleAlert Pro' });

    await interaction.reply({ embeds: [embed], ephemeral: true });

  } catch (error) {
    await interaction.reply({
      content: '❌ An error occurred. Please try again later.',
      ephemeral: true,
    });
  }
}